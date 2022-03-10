
import { Listener } from 'jsignal'

import { PostCubeLogger } from '../logger'
import {
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    DEFAULT_TIMEOUT_IO,
    DEFAULT_TIMEOUT_LISTEN,
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
} from '../constants/bluetooth'
import { bleErrors } from '../errors'
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
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
): Promise<PostCube> => {
    const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: false,
        optionalServices: services,
        filters: [{
            namePrefix,
            // services: [],
        }],
    })

    return new PostCubeWeb(device)
}

export const scanForPostCubes = async(
    options: ScanOptions = {},
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
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
    readonly device: BluetoothDevice
    gattServer: BluetoothRemoteGATTServer

    get deviceId(): string {
        return this.device?.id
    }

    get isConnected(): boolean {
        return !!this.gattServer?.connected
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

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(`Connecting to PostCube (ID: ${this.id}) [WebBluetooth]`)

        let timeout, isConnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isConnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out connecting to PostCube (ID: ${this.id}) [WebBluetooth]`)
            }, timeoutMs)
        }

        this.gattServer = await this.gattServer.connect()

        isConnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.emit('change', this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(`Disconnecting from PostCube (ID: ${this.id}) [WebBluetooth]`)

        let timeout, isDisconnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDisconnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out disconnecting to PostCube (ID: ${this.id}) [WebBluetooth]`)
            }, timeoutMs)
        }

        if (this.isConnected) {
            await this.gattServer.disconnect()
        }

        this.gattServer = null
        isDisconnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.emit('change', this)
    }

    async read(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<DataView> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID }, `Reading value from PostCube (ID: ${this.id}) [WebBluetooth]`)

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out reading value from PostCube (ID: ${this.id}) [WebBluetooth]`)
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
        PostCubeLogger.debug({ serviceUUID, characteristicUUID, value }, `Writing value to PostCube (ID: ${this.id}) [WebBluetooth]`)

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out writing value to PostCube (ID: ${this.id}) [WebBluetooth]`)
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
            `Listening for value change on PostCube (ID: ${this.id}) [WebBluetooth]`,
        )

        let timeout, isListening = true
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (!isListening) {
                    return
                }

                stopListening()
                throw bleErrors.timeout(`Timed out listening for value change on PostCube (ID: ${this.id}) [WebBluetooth]`)
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
                `Stopped listening for value change on PostCube (ID: ${this.id}) [WebBluetooth]`,
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
