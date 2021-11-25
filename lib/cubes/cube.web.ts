
import { jSignal } from 'jsignal'

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

export const isEnabledWeb = async(): Promise<boolean> => {
    return (
        typeof navigator?.bluetooth?.getAvailability === 'function'
        && await navigator.bluetooth.getAvailability()
    )
}

export const requestCubeWeb = async(namePrefix: string, services: string[]): Promise<Cube> => {
    const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: false,
        optionalServices: services,
        filters: [{
            namePrefix,
            // services: [],
        }],
    })

    return CubeWeb(device)
}

export const scanForCubesWeb = async(options: ScanOptions = {}): Promise<ScanResult> => {
    throw cubeErrors.notSupported(`scanForCubes is not supported on platform 'WebBluetooth'`)
}

export const CubeWeb = (device: BluetoothDevice): Cube => {
    const onChange = new jSignal<Cube>()
    const { id, isMultibox } = parseBoxName(device?.name)

    let cube: Cube
    let gattServer: BluetoothRemoteGATTServer = device?.gatt

    const connect = async(timeout: number = DEFAULT_TIMEOUT_CONNECT) => {
        gattServer = await gattServer.connect()
        onChange.dispatch(cube)
    }

    const disconnect = async(timeout: number = DEFAULT_TIMEOUT_DISCONNECT) => {
        if (cube.isConnected) {
            await gattServer.disconnect()
        }

        gattServer = null
        onChange.dispatch(cube)
    }

    const getRSSI = async(): Promise<number> => {
        throw cubeErrors.notSupported(`RSSI is not supported on platform 'WebBluetooth'`)
    }

    const getCharacteristic = async(
        serviceUUID: string,
        characteristicUUID: string,
    ): Promise<BluetoothRemoteGATTCharacteristic> => {
        const service = await device.gatt.getPrimaryService(serviceUUID)
        return await service.getCharacteristic(characteristicUUID)
    }

    const read = async(serviceUUID: string, characteristicUUID: string): Promise<DataView> => {
        const characteristic = await getCharacteristic(serviceUUID, characteristicUUID)
        return await characteristic.readValue()
    }

    const write = async(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void> => {
        const characteristic = await getCharacteristic(serviceUUID, characteristicUUID)
        await characteristic.writeValue(value)
    }

    return (cube = {
        ...cubeServices(() => cube),
        get id(): string {
            return id
        },
        get name(): string {
            return device?.name
        },
        get deviceId(): string {
            return device?.id
        },
        get isConnected(): boolean {
            return !!gattServer?.connected
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
