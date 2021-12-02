
import { Listener } from 'jsignal'
import * as noble from '@abandonware/noble'

import { logger } from '../logger'
import {
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
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

export const isEnabledNode = async(): Promise<boolean> => {
    return true
}

export const requestPostCubeNode = async(
    namePrefix: string,
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
): Promise<PostCube> => {
    throw bleErrors.notSupported(`requestPostCube is not supported on platform 'Node.js'`)
}

export const scanForPostCubesNode = async(
    options: ScanOptions = {},
    services: string[] = [],
): Promise<ScanResult> => {
    let shouldStopScan = false
    let scanTimeout

    const stopScan = async() => {
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
    readonly peripheral: noble.Peripheral

    get deviceId(): string {
        return this.peripheral?.id
    }

    get isConnected(): boolean {
        return this.peripheral?.state === 'connected'
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
        logger.debug(`Connecting to PostCube (ID: ${this.id}) [@abandonware/noble]`)

        await this.peripheral.connectAsync()
        this.emit('change', this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        logger.debug(`Disconnecting from PostCube (ID: ${this.id}) [@abandonware/noble]`)

        await this.peripheral.disconnectAsync()
        this.emit('change', this)
    }

    async read(serviceUUID: string, characteristicUUID: string): Promise<DataView> {
        logger.debug(
            { serviceUUID, characteristicUUID },
            `Reading value from PostCube (ID: ${this.id}) [@abandonware/noble]`,
        )

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        const buffer = await characteristic.readAsync()

        return new DataView(buffer)
    }

    async write(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void> {
        logger.debug(
            { serviceUUID, characteristicUUID, value },
            `Writing value to PostCube (ID: ${this.id}) [@abandonware/noble]`,
        )

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)

        const buffer = Buffer.from(value.buffer)
        await characteristic.writeAsync(buffer, true)
    }

    async listenForNotifications(serviceUUID: string, characteristicUUID: string, listener: Listener<DataView>): Promise<StopNotifications> {
        logger.debug(
            { serviceUUID, characteristicUUID },
            `Listening for value change on PostCube (ID: ${this.id}) [@abandonware/noble]`,
        )

        const handleCharacteristicValueChanged = event => {
            if (typeof listener === 'function') {
                listener(event.target.value)
            }
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        // characteristic.addListener()

        return () => {
            logger.debug(
                { serviceUUID, characteristicUUID },
                `Stopped listening for value change on PostCube (ID: ${this.id}) [@abandonware/noble]`,
            )

            // characteristic.removeListener()
        }
    }
}
