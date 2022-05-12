
import { jSignal, Listener } from 'jsignal'
import {
    BleClient,
    BleDevice,
    ScanResult as CapacitorScanResult,
} from '@capacitor-community/bluetooth-le'

import { PostCubeLogger } from '../logger'
import { bleErrors } from '../errors'
import {
    PostCubeVersion,
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
import { resolveVersionFromAvailableServices, templater } from '../helpers'
import {
    PostCube,
    ScanOptions,
    ScanResult,
    Unwatch,
} from './postcube'

export const isEnabled = async(): Promise<boolean> => {
    return await BleClient.isEnabled()
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
    await BleClient.initialize()

    const device = await BleClient.requestDevice({
        namePrefix,
        optionalServices: services as string[],
    })

    return new PostCubeCapacitor(device)
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
    const abortSignal = new jSignal()
    let scanTimeout

    const stopScan = async() => {
        if (scanTimeout) {
            clearTimeout(scanTimeout)
        }

        scanTimeout = null
        abortSignal.dispatch()

        await BleClient.stopLEScan()
    }

    const handleDiscovery = (result: CapacitorScanResult) => {
        try {
            const postCube = new PostCubeCapacitor(result.device)

            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(postCube)
            }
        } catch (err) {
            // console.error(err)
        }
    }

    const startScan = async(): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            abortSignal.listen(resolve)

            if (options?.timeout && options.timeout > 0) {
                scanTimeout = setTimeout(stopScan, options.timeout)
            }

            await BleClient.requestLEScan({
                namePrefix: options.namePrefix,
                optionalServices: services as string[],
            }, handleDiscovery)
        })
    }

    return {
        promise: startScan(),
        stopScan,
    }
}

export class PostCubeCapacitor extends PostCube {
    static PlatformName = '@capacitor-community/bluetooth-le'

    readonly device: BleDevice

    private _isConnected: boolean = false
    private _version: PostCubeVersion

    get deviceId(): string {
        return this.device?.deviceId
    }

    get isConnected(): boolean {
        return this._isConnected
    }

    get version(): PostCubeVersion {
        return this._version
    }

    constructor(device: BleDevice) {
        super(device?.name)

        this.device = device
    }

    protected tmpl(string: string) {
        return templater({
            platform: PostCubeCapacitor.PlatformName,
            id: this.id,
            version: this.version,
        }).parse(string)
    }

    private handleDisconnect(deviceId: string) {
        PostCubeLogger.debug(`PostCube (ID: ${this.id}) has been disconnected [${PostCubeCapacitor.PlatformName}]`)

        this._isConnected = false
        this.onChange.dispatch(this)
    }

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(`Connecting to PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`)

        let timeout, isConnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isConnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out connecting to PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`)
            }, timeoutMs)
        }

        await BleClient.connect(this.deviceId, this.handleDisconnect, { timeout: timeoutMs })

        const services = await BleClient.getServices(this.deviceId)
        this._version = await resolveVersionFromAvailableServices(
            services.map(service => service.uuid),
        )

        this._isConnected = true
        isConnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.onChange.dispatch(this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(`Disconnecting from PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`)

        let timeout, isDisconnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDisconnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out disconnecting to PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`)
            }, timeoutMs)
        }

        await BleClient.disconnect(this.deviceId)

        this._isConnected = false
        isDisconnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.onChange.dispatch(this)
    }

    async read(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<DataView> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            `Reading value from PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`,
        )

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out reading value from PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`)
            }, timeoutMs)
        }

        const value = await BleClient.read(this.deviceId, serviceUUID, characteristicUUID)

        isDone = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        return value
    }

    async write(
        serviceUUID: string,
        characteristicUUID: string,
        value: DataView,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<void> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID, value },
            `Writing value to PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`,
        )

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out writing value to PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`)
            }, timeoutMs)
        }

        await BleClient.write(this.deviceId, serviceUUID, characteristicUUID, value)

        isDone = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    async startNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_LISTEN,
    ) {
        throw bleErrors.notSupported('Not Implemented, for now anyway')
    }

    async watchNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<DataView>,
        timeoutMs: number = DEFAULT_TIMEOUT_LISTEN,
    ): Promise<Unwatch> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            `Listening for value change on PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`,
        )

        let timeout, isListening = true
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (!isListening) {
                    return
                }

                stopListening()
                throw bleErrors.timeout(`Timed out listening for value change on PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`)
            }, timeoutMs)
        }

        await BleClient.startNotifications(this.deviceId, serviceUUID, characteristicUUID, (value: DataView) => {
            if (isListening && typeof listener === 'function') {
                listener(value)
            }
        })

        const stopListening = () => {
            PostCubeLogger.debug(
                { serviceUUID, characteristicUUID },
                `Stopped listening for value change on PostCube (ID: ${this.id}) [${PostCubeCapacitor.PlatformName}]`,
            )

            isListening = false
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }

            BleClient.stopNotifications(this.deviceId, serviceUUID, characteristicUUID)
        }

        return stopListening
    }
}
