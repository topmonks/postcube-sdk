
import { jSignal } from 'jsignal'
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le'

import {
    Cube,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
} from './cube'
import { cubeServices } from './services'

export const CubeCapacitor = (device: BleDevice): Cube => {
    const onChange = new jSignal<Cube>()

    let cube: Cube
    let isConnected: boolean = false

    const handleDisconnect = async(deviceId: string) => {}

    const connect = async(timeout: number = DEFAULT_TIMEOUT_CONNECT) => {
        await BleClient.connect(device.deviceId, handleDisconnect, { timeout })
        isConnected = true
        onChange.dispatch()
    }

    const disconnect = async() => {
        await BleClient.disconnect(device.deviceId)
        isConnected = false
        onChange.dispatch(cube)
    }

    const transaction = async(exec: () => any) => {
        await connect()
        await exec()
        await disconnect()
    }

    const read = async(serviceUUID: string, characteristicUUID: string): Promise<DataView> => {
        return await BleClient.read(device.deviceId, serviceUUID, characteristicUUID)
    }

    const write = async(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void> => {
        await BleClient.write(device.deviceId, serviceUUID, characteristicUUID, value)
    }

    return (cube = {
        ...cubeServices(cube),
        get name(): string {
            return device.name
        },
        get isConnected(): boolean {
            return isConnected
        },
        onChange,
        connect,
        disconnect,
        transaction,
        read,
        write,
    })
}
