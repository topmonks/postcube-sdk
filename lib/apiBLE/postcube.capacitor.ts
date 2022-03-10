
import { jSignal, Listener } from 'jsignal'
import {
    BleClient,
    BleDevice,
    ScanResult as CapacitorScanResult,
} from '@capacitor-community/bluetooth-le'

import { PostCubeLogger } from '../logger'
import { bleErrors } from '../errors'
import {
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    DEFAULT_TIMEOUT_IO,
    DEFAULT_TIMEOUT_LISTEN,
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
} from '../constants/bluetooth'
import {
    PostCube,
    ScanOptions,
    ScanResult,
    StopNotifications,
} from './postcube'

export const isEnabled = async(): Promise<boolean> => {
    return await BleClient.isEnabled()
}

export const requestPostCube = async(
    namePrefix: string,
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
): Promise<PostCube> => {
    await BleClient.initialize()

    const device = await BleClient.requestDevice({
        namePrefix,
        optionalServices: services,
    })

    return new PostCubeCapacitor(device)
}

export const scanForPostCubes = async(
    options: ScanOptions = {},
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
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
                optionalServices: services,
            }, handleDiscovery)
        })
    }

    return {
        promise: startScan(),
        stopScan,
    }
}

export class PostCubeCapacitor extends PostCube {
    readonly device: BleDevice

    private _isConnected: boolean = false

    get deviceId(): string {
        return this.device?.deviceId
    }

    get isConnected(): boolean {
        return this._isConnected
    }

    constructor(device: BleDevice) {
        super(device?.name)

        this.device = device
    }

    private handleDisconnect(deviceId: string) {
        PostCubeLogger.debug(`PostCube (ID: ${this.id}) has been disconnected [@capacitor-community/bluetooth-le]`)

        this._isConnected = false
        this.emit('change', this)
    }

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(`Connecting to PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`)

        let timeout, isConnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isConnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out connecting to PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`)
            }, timeoutMs)
        }

        await BleClient.connect(this.deviceId, this.handleDisconnect, { timeout: timeoutMs })

        this._isConnected = true
        isConnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.emit('change', this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(`Disconnecting from PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`)

        let timeout, isDisconnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDisconnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out disconnecting to PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`)
            }, timeoutMs)
        }

        await BleClient.disconnect(this.deviceId)

        this._isConnected = false
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
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            `Reading value from PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`,
        )

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out reading value from PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`)
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
            `Writing value to PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`,
        )

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out writing value to PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`)
            }, timeoutMs)
        }

        await BleClient.write(this.deviceId, serviceUUID, characteristicUUID, value)

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
            `Listening for value change on PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`,
        )

        let timeout, isListening = true
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (!isListening) {
                    return
                }

                stopListening()
                throw bleErrors.timeout(`Timed out listening for value change on PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`)
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
                `Stopped listening for value change on PostCube (ID: ${this.id}) [@capacitor-community/bluetooth-le]`,
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
