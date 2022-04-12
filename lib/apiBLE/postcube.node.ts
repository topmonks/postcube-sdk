
import { Buffer } from 'buffer'
import { Listener } from 'jsignal'
import type * as noble from '@abandonware/noble'

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

let nobleInstance
const getNobleInstance = async() => {
    if (['1', 'true', 't', 'yes', 'y'].indexOf(String(process.env['POSTCUBE_ENABLE_NOBLE']).toLowerCase()) < 0) {
        throw bleErrors.notSupported(
            `SDK dependency '@abandonware/noble' is disabled by default; add 'POSTCUBE_ENABLE_NOBLE=true' as your ENV variable to manually enable dependency and confirm that your machine supports bluetooth`,
        )
    }

    if (!nobleInstance) {
        nobleInstance = await require('@abandonware/noble')
    }

    return nobleInstance
}

export const isEnabled = async(): Promise<boolean> => {
    return true
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
    throw bleErrors.notSupported(`requestPostCube is not supported on platform 'Node.js'`)
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
    let shouldStopScan = false
    let scanTimeout

    const stopScan = async() => {
        const noble = await getNobleInstance()

        if (scanTimeout) {
            clearTimeout(scanTimeout)
        }

        scanTimeout = null

        noble.removeListener('discover', handleDiscovery)
        await noble.stopScanningAsync()
    }

    const handleDiscovery = (peripheral: noble.Peripheral) => {
        try {
            const postCube = new PostCubeNode(peripheral)

            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(postCube)
            }
        } catch (err) {
            // console.error(err)
        }
    }

    const startScan = async() => {
        const noble = await getNobleInstance()

        if (options?.timeout && options.timeout > 0) {
            scanTimeout = setTimeout(stopScan, options.timeout)
        }

        noble.on('discover', handleDiscovery)

        await noble.startScanningAsync(services, true)

        while (!shouldStopScan) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }

    return {
        promise: startScan(),
        stopScan,
    }
}

export class PostCubeNode extends PostCube {
    static PlatformName = '@abandonware/noble'

    readonly peripheral: noble.Peripheral
    private _version: PostCubeVersion

    get deviceId(): string {
        return this.peripheral?.id
    }

    get isConnected(): boolean {
        return this.peripheral?.state === 'connected'
    }

    get version(): PostCubeVersion {
        return this._version
    }

    constructor(peripheral: noble.Peripheral) {
        super(peripheral?.advertisement?.localName)

        this.peripheral = peripheral
    }

    private async getCharacteristic(
        serviceUUID: string,
        characteristicUUID: string,
    ): Promise<noble.Characteristic> {
        try {
            const { characteristics } = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync([serviceUUID], [characteristicUUID])

            if (!!characteristics?.length < true || !characteristics[0]?.uuid) {
                throw bleErrors.unknownBLECharacteristic(`Unknown bluetooth characteristic '${characteristicUUID}'`)
            }

            return characteristics[0]
        } catch (err) {
            console.error(err)
            // check what went wrong and throw cubeError

            throw err
        }
    }

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(`Connecting to PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`)

        let timeout, isConnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isConnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out connecting to PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`)
            }, timeoutMs)
        }

        await this.peripheral.connectAsync()

        this._version = await resolveVersionFromAvailableServices(
            this.peripheral.services.map(service => service.uuid),
        )

        isConnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        this.onChange.dispatch(this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(`Disconnecting from PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`)

        let timeout, isDisconnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDisconnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out disconnecting to PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`)
            }, timeoutMs)
        }

        await this.peripheral.disconnectAsync()

        isDisconnected = true
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
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            `Reading value from PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`,
        )

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out reading value from PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`)
            }, timeoutMs)
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        const buffer = await characteristic.readAsync()

        isDone = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        return new DataView(buffer)
    }

    async write(
        serviceUUID: string,
        characteristicUUID: string,
        value: DataView,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<void> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID, value },
            `Writing value to PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`,
        )

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out writing value to PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`)
            }, timeoutMs)
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)

        const buffer = Buffer.from(value.buffer)
        await characteristic.writeAsync(buffer, true)

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
            `Listening for value change on PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`,
        )

        let timeout, isListening = true
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (!isListening) {
                    return
                }

                stopListening()
                throw bleErrors.timeout(`Timed out listening for value change on PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`)
            }, timeoutMs)
        }

        const handleCharacteristicValueChanged = event => {
            if (isListening && typeof listener === 'function') {
                listener(event.target.value)
            }
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        // characteristic.addListener()

        const stopListening = () => {
            PostCubeLogger.debug(
                { serviceUUID, characteristicUUID },
                `Stopped listening for value change on PostCube (ID: ${this.id}) [${PostCubeNode.PlatformName}]`,
            )

            isListening = false
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }

            // characteristic.removeListener()
        }

        return stopListening
    }
}
