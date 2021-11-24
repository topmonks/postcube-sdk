
import { jSignal } from 'jsignal'

import {
    Cube,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
} from './cube'
import { cubeServices } from './services'

export const CubeWeb = (device: BluetoothDevice): Cube => {
    const onChange = new jSignal<Cube>()

    let cube: Cube
    let gattServer: BluetoothRemoteGATTServer = device?.gatt

    const connect = async(timeout: number = DEFAULT_TIMEOUT_CONNECT) => {
        gattServer = await gattServer.connect()
        onChange.dispatch()
    }

    const disconnect = async() => {
        if (cube.isConnected) {
            await gattServer.disconnect()
        }

        gattServer = null
        onChange.dispatch(cube)
    }

    const transaction = async(exec: () => any) => {
        await connect()
        await exec()
        await disconnect()
    }

    const read = async(serviceUUID: string, characteristicUUID: string): Promise<DataView> => {
        return new DataView(new ArrayBuffer(0))
    }

    const write = async(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void> => {
    }

    return (cube = {
        ...cubeServices(cube),
        get name(): string {
            return device.name
        },
        get isConnected(): boolean {
            return !!gattServer?.connected
        },
        onChange,
        connect,
        disconnect,
        transaction,
        read,
        write,
    })
}
