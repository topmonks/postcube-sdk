
import { jSignal } from 'jsignal'
import * as noble from '@abandonware/noble'

import { cubeErrors } from '../errors'
import { parseBoxName } from '../helpers'
import {
    Cube,
    ScanOptions,
    ScanResult,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
} from './cube'
import { cubeServices } from './services'

export const isEnabledNode = async(): Promise<boolean> => {
    return true
}

export const requestCubeNode = async(namePrefix: string, services: string[]): Promise<Cube> => {
    throw cubeErrors.notSupported(`requestCube is not supported on platform 'Node.js'`)
}

export const scanForCubesNode = async(options: ScanOptions = {}): Promise<ScanResult> => {
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
            const cube = CubeNode(peripheral)

            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(cube)
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

        await noble.startScanningAsync(
            options?.services ?
                options.services : [],
            true,
        )

        while (!shouldStopScan) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }

    return {
        promise: startScan(),
        stopScan,
    }
}

export const CubeNode = (peripheral: noble.Peripheral): Cube => {
    const onChange = new jSignal<Cube>()
    const { id, isMultibox } = parseBoxName(peripheral?.advertisement?.localName)

    let cube: Cube

    const connect = async(timeout: number = DEFAULT_TIMEOUT_CONNECT) => {
        await peripheral.connectAsync()
        onChange.dispatch(cube)
    }

    const disconnect = async(timeout: number = DEFAULT_TIMEOUT_DISCONNECT) => {
        await peripheral.disconnectAsync()
        onChange.dispatch(cube)
    }

    const getRSSI = async(): Promise<number> => {
        return peripheral?.rssi
    }

    const getCharacteristic = async(
        serviceUUID: string,
        characteristicUUID: string,
    ): Promise<noble.Characteristic> => {
        try {
            const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([serviceUUID], [characteristicUUID])

            if (!!characteristics?.length < true || !characteristics[0]?.uuid) {
                throw cubeErrors.unknownBLECharacteristic(`Unknown bluetooth characteristic '${characteristicUUID}'`)
            }

            return characteristics[0]
        } catch (err) {
            console.error(err)
            // check what went wrong and throw cubeError

            throw err
        }
    }

    const read = async(serviceUUID: string, characteristicUUID: string): Promise<DataView> => {
        const characteristic = await getCharacteristic(serviceUUID, characteristicUUID)
        const buffer = await characteristic.readAsync()

        return new DataView(buffer)
    }

    const write = async(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void> => {
        const characteristic = await getCharacteristic(serviceUUID, characteristicUUID)

        const buffer = Buffer.from(value.buffer)
        await characteristic.writeAsync(buffer, true)
    }

    return (cube = {
        ...cubeServices(() => cube),
        get id(): string {
            return id
        },
        get name(): string {
            return peripheral?.advertisement?.localName
        },
        get deviceId(): string {
            return peripheral?.id
        },
        get isConnected(): boolean {
            return peripheral?.state === 'connected'
        },
        get isMultibox(): boolean {
            return isMultibox
        },
        onChange,
        connect,
        disconnect,
        getRSSI,
        read,
        write,
    })
}
