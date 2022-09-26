
import { jSignal, Listener } from 'jsignal'
import { times } from 'lodash'
import ble from 'cordova-plugin-ble-central/www/ble'

import type {
    CordovaBLEDevice,
    CordovaBLEDeviceConnected,
} from '../cordova-plugin-ble-central'
import { PostCubeLogger } from '../logger'
import { BleErrorCode, bleErrors } from '../errors'
import {
    PostCubeVersion,
    DEFAULT_TIMEOUT_SCAN,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    DEFAULT_TIMEOUT_IO,
    DEFAULT_TIMEOUT_LISTEN,
    DEPRECATED_SERVICE_UUID,
    DEPRECATED_SERVICE_UUID_16,
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
    SERVICE_UUID_16,
} from '../constants/bluetooth'
import {
    resolveVersionFromAdvertisingData,
    resolveVersionFromAvailableServices,
    sleep,
    templater,
    withTimeoutRace,
} from '../helpers'
import {
    PostCube,
    ScanOptions,
    ScanResult,
    Unwatch,
} from './postcube'

export const isEnabled = async(): Promise<boolean> => {
    return new Promise(resolve => {
        ble.isEnabled(
            () => resolve(true),
            () => resolve(false),
        )
    })
}

export const requestPostCube = async(
    namePrefix: string,
    services: (string|number)[] = [
        SERVICE_BATTERY_UUID,
        SERVICE_UUID,
        SERVICE_UUID_16,
        DEPRECATED_SERVICE_UUID,
        DEPRECATED_SERVICE_UUID_16,
    ],
): Promise<PostCube> => {
    PostCubeLogger.warn({}, `requestPostCube is not supported on [${PostCubeCordova.PlatformName}]`)
    throw bleErrors.notSupported(`requestPostCube is not supported on [${PostCubeCordova.PlatformName}]`)
}

export const scanForPostCubes = async(
    options: ScanOptions = {},
    services: (string|number)[] = [
        SERVICE_BATTERY_UUID,
        SERVICE_UUID,
        SERVICE_UUID_16,
        DEPRECATED_SERVICE_UUID,
        DEPRECATED_SERVICE_UUID_16,
    ],
): Promise<ScanResult> => {
    let isScanning = true
    const stopScan = () => {
        return new Promise((resolve, reject) => {
            isScanning = false

            ble.stopStateNotifications()
            ble.stopScan(resolve, reject)
        })
    }

    const promise = withTimeoutRace<void>(async(resolve, reject) => {
        ble.startStateNotifications(state => {
            switch (state) {
                case 'on':
                    // return reject(null)
                    return
                case 'off':
                    isScanning = false
                    return reject({
                        name: BleErrorCode.bluetoothDisabled,
                        code: 'bluetooth-disabled',
                        message: 'BLE disabled',
                    })
                case 'unauthorized':
                    isScanning = false
                    return reject({
                        name: BleErrorCode.invalidAuthentication,
                        code: 'bluetooth-unauthorized',
                        message: 'BLE unauthorized',
                    })
                case 'unsupported':
                    isScanning = false
                    return reject({
                        name: BleErrorCode.notSupported,
                        code: 'BLE unsupported',
                        message: 'BLE unsupported',
                    })
                case 'resetting':
                    isScanning = false
                    return reject({
                        name: null,
                        code: 'BLE resseting',
                        message: 'BLE resseting',
                    })
                default:
                    PostCubeLogger.error({ state }, `Unknown state notification [${PostCubeCordova.PlatformName}]`)
            }
        })

        const handleDevice = bleDevice => {
            if (typeof options.onDiscovery === 'function') {
                options.onDiscovery(new PostCubeCordova(bleDevice))
            }
        }

        const handleError = err => {
            isScanning = false
            reject(err)
        }

        while (isScanning) {
            if (!await isEnabled()) {
                await sleep(100)
                continue
            }

            ble.startScan(services, handleDevice, handleError)
        }
    }, options.timeout || DEFAULT_TIMEOUT_SCAN, bleErrors.timeout('Scan Timed Out'), false)

    return {
        promise: promise.catch(err => {
            stopScan()

            throw err
        }),
        stopScan,
    }
}

export class PostCubeCordova extends PostCube {
    static PlatformName = 'cordova-plugin-ble-central'

    private device: CordovaBLEDevice
    private deviceConnected: CordovaBLEDeviceConnected

    private _isConnected: boolean = false
    private _version: PostCubeVersion
    private _detectVersionOnConnect: boolean = true

    get deviceId(): string {
        return this.device?.id
    }

    get isConnected(): boolean {
        this.isConnectedAsync().then(isConnected => {
            if (isConnected !== this._isConnected) {
                this._isConnected = isConnected
                this.onChange.dispatch(this)
            }
        })

        return this._isConnected
    }

    get version(): PostCubeVersion {
        return this._version
    }

    private isConnectedAsync() {
        return new Promise<boolean>((resolve, reject) => {
            ble.isConnected(this.device.id, resolve, reject)
        })
    }

    constructor(device: CordovaBLEDevice) {
        super(device?.name)

        this.device = device

        if (this.device.advertising) {
            this._version = resolveVersionFromAdvertisingData(this.device.advertising)

            if (this._version) {
                this._detectVersionOnConnect = false
            }
        }
    }

    protected tmpl(string: string) {
        return templater({
            platform: PostCubeCordova.PlatformName,
            id: this.id,
            version: this.version,
        }).parse(string)
    }

    // private handleDisconnect() {
    //     PostCubeLogger.debug({ event }, this?.tmpl(`Disconnected from %id_platform%`))

    //     this.isConnectedAsync()
    //         .then(isConnected => this._isConnected = isConnected)
    //         .finally(() => this.onChange.dispatch(this))
    // }

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(this?.tmpl(`Connecting to %id_platform%`))

        if (this.isConnected) {
            PostCubeLogger.warn({ postCube: this }, this?.tmpl(`Already connected to %id_platform%`))
            return
        }

        this.deviceConnected = await withTimeoutRace<CordovaBLEDeviceConnected>((resolve, reject) => {
            ble.connect(this.deviceId, resolve, reject)

            return null
        }, timeoutMs, bleErrors.timeout(this?.tmpl(`Timed out connecting to %id_platform%`)), false)

        this._isConnected = await this.isConnectedAsync()

        if (this._detectVersionOnConnect) {
            this._version = await resolveVersionFromAvailableServices(this.deviceConnected.services)
        }

        this.onChange.dispatch(this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(this?.tmpl(`Disconnecting from %id_platform%`))

        if (!this.isConnected || this.activeOperations > 0) {
            return
        }

        await withTimeoutRace(async(resolve, reject) => {
            ble.disconnect(this.deviceId, resolve, reject)
        }, timeoutMs, bleErrors.timeout(this?.tmpl(`Timed out disconnecting from %id_platform%`)), false)

        this._isConnected = await this.isConnectedAsync()

        this.onChange.dispatch(this)
    }

    async read(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<DataView|ArrayBuffer> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID }, this?.tmpl(`Reading value from %id_platform%`))

        const value = await withTimeoutRace<ArrayBuffer>((resolve, reject) => {
            ble.read(this.deviceId, serviceUUID, characteristicUUID, resolve, reject)

            return null
        }, timeoutMs, bleErrors.timeout(this?.tmpl(`Timed out reading value from %id_platform%`)), false)

        return value
    }

    async write(
        serviceUUID: string,
        characteristicUUID: string,
        value: DataView,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<void> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID, value }, this?.tmpl(`Writing value to PostCube %id_platform%`))

        const valueArrayBuffer = new Uint8Array(
            times(value.byteLength, offset => value.getUint8(offset)),
        )

        await withTimeoutRace(async(resolve, reject) => {
            ble.write(this.deviceId, serviceUUID, characteristicUUID, valueArrayBuffer, resolve, reject)

            return null
        }, timeoutMs, bleErrors.timeout(this?.tmpl(`Timed out writing value to %id_platform%`)), false)
    }

    async startNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_LISTEN,
    ) {
        PostCubeLogger.info(
            { serviceUUID, characteristicUUID, timeoutMs },
            this?.tmpl(`Ignoring startNotifications on PostCube %id%; Unnecessary on %platform%`),
        )
    }

    async watchNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<ArrayBuffer>,
        timeoutMs: number = DEFAULT_TIMEOUT_LISTEN,
    ): Promise<Unwatch> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            this?.tmpl(`Watching for notifications on %id_platform%`),
        )

        const handleCharacteristicValueChanged = buffer => {
            if (typeof listener === 'function') {
                listener(new Uint8Array(buffer))
            }
        }

        let unwatch: Unwatch
        await withTimeoutRace(async(resolve, reject) => {
            ble.startNotification(
                this.deviceId,
                serviceUUID,
                characteristicUUID,
                handleCharacteristicValueChanged,
                reject,
            )

            unwatch = () => new Promise((resolve, reject) =>
                ble.stopNotification(this.deviceId, serviceUUID, characteristicUUID, resolve, reject))
        }, timeoutMs, bleErrors.timeout(this?.tmpl(`Timed out adding value change listener on %id_platform%`)))

        return unwatch
    }
}
