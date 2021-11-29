
import { jSignal, Listener } from 'jsignal'

import {
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
} from '../constants/bluetooth'
import { cubeErrors } from '../errors'
import { parseBoxName } from '../helpers'
import {
    Cube,
    ScanOptions,
    ScanResult,
    StopNotifications,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
} from './cube'
import { cubeCommands } from './commands'

export const isEnabledWeb = async(): Promise<boolean> => {
    return (
        typeof navigator?.bluetooth?.getAvailability === 'function'
        && await navigator.bluetooth.getAvailability()
    )
}

export const requestCubeWeb = async(
    namePrefix: string,
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
): Promise<Cube> => {
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
    return {
        async stopScan() {},
        promise: requestCubeWeb(options.namePrefix, options.services).then(cube => {
            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(cube)
            }
        }),
    }
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

    const listenForNotifications = async(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<DataView>,
    ): Promise<StopNotifications> => {
        const handleCharacteristicValueChanged = event => {
            if (typeof listener === 'function') {
                listener(event.target.value)
            }
        }

        const characteristic = await getCharacteristic(serviceUUID, characteristicUUID)

        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)
        return () =>
            characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)
    }

    return (cube = {
        ...cubeCommands(() => cube),
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
        listenForNotifications,
    })
}
