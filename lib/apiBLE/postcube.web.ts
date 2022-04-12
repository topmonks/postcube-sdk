
import { Listener } from 'jsignal'

import { PostCubeLogger } from '../logger'
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
import { bleErrors } from '../errors'
import { resolveVersionFromAvailableServices } from '../helpers'
import {
    PostCube,
    ScanOptions,
    ScanResult,
    StopNotifications,
} from './postcube'

export const isEnabled = async(): Promise<boolean> => {
    return (
        typeof navigator?.bluetooth?.getAvailability === 'function'
        && await navigator.bluetooth.getAvailability()
    )
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
    const requestDeviceOptions = {
        acceptAllDevices: false,
        optionalServices: services,
        filters: [{
            namePrefix,
            // services: [],
        }],
    }

    PostCubeLogger.debug(requestDeviceOptions, `Request device options [${PostCubeWeb.PlatformName}]`)

    const device = await navigator.bluetooth.requestDevice(requestDeviceOptions)

    return new PostCubeWeb(device)
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
    return {
        async stopScan() {},
        promise: requestPostCube(options.namePrefix, services).then(postCube => {
            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(postCube)
            }
        }),
    }
}

export class PostCubeWeb extends PostCube {
    static PlatformName = 'WebBluetooth'

    readonly device: BluetoothDevice
    gattServer: BluetoothRemoteGATTServer

    private _version: PostCubeVersion

    get deviceId(): string {
        return this.device?.id
    }

    get isConnected(): boolean {
        return !!this.gattServer?.connected || !!this.gattServer?.device?.gatt?.connected
    }

    get version(): PostCubeVersion {
        return this._version
    }

    constructor(device: BluetoothDevice) {
        super(device?.name)

        this.device = device
        this.gattServer = device?.gatt
    }

    private async getCharacteristic(
        serviceUUID: string,
        characteristicUUID: string,
    ): Promise<BluetoothRemoteGATTCharacteristic> {
        const service = await this.gattServer.getPrimaryService(serviceUUID)
        return await service.getCharacteristic(characteristicUUID)
    }

    private async handleGattServerDisconnected(event: Event) {
        PostCubeLogger.debug({ event }, `Disconnected from PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)

        this.gattServer = null
        this.onChange.dispatch(this)
    }

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(`Connecting to PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)

        let timeout
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (this.isConnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out connecting to PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)
            }, timeoutMs)
        }

        this.gattServer = await this.gattServer.connect()

        this.gattServer.device.addEventListener('gattserverdisconnected', this.handleGattServerDisconnected)

        const primaryServices = await this.gattServer.getPrimaryServices()
        this._version = await resolveVersionFromAvailableServices(
            primaryServices.map(service => service.uuid),
        )

        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.onChange.dispatch(this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(`Disconnecting from PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)

        let timeout
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (!this.isConnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out disconnecting to PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)
            }, timeoutMs)
        }

        if (this.isConnected) {
            await this.gattServer.disconnect()
        }

        this.gattServer = null
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.onChange.dispatch(this)
    }

    async readV2(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<DataView> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID }, `Reading value from PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out reading value from PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)
            }, timeoutMs)
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        const value = await characteristic.readValue()

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
        PostCubeLogger.debug({ serviceUUID, characteristicUUID, value }, `Writing value to PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out writing value to PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)
            }, timeoutMs)
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        await characteristic.writeValue(value)

        isDone = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    async listenForNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<DataView>,
        timeoutMs: number = DEFAULT_TIMEOUT_LISTEN,
    ): Promise<StopNotifications> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            `Listening for value change on PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`,
        )

        let timeout, isListening = true
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (!isListening) {
                    return
                }

                stopListening()
                throw bleErrors.timeout(`Timed out listening for value change on PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`)
            }, timeoutMs)
        }

        const handleCharacteristicValueChanged = event => {
            if (isListening && typeof listener === 'function') {
                listener(event.target.value)
            }
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)

        const stopListening = () => {
            PostCubeLogger.debug(
                { serviceUUID, characteristicUUID },
                `Stopped listening for value change on PostCube (ID: ${this.id}) [${PostCubeWeb.PlatformName}]`,
            )

            isListening = false
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }

            characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)
        }

        return stopListening
    }
}
