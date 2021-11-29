
import { jSignal, Listener } from 'jsignal'
import {
    BleClient,
    BleDevice,
    ScanResult as CapacitorScanResult,
} from '@capacitor-community/bluetooth-le'

import {
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
} from '../constants/bluetooth'
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

export const isEnabledCapacitor = async(): Promise<boolean> => {
    return await BleClient.isEnabled()
}

export const requestCubeCapacitor = async(
    namePrefix: string,
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
): Promise<Cube> => {
    await BleClient.initialize()

    const device = await BleClient.requestDevice({
        namePrefix,
        optionalServices: services,
    })

    return CubeCapacitor(device)
}

export const scanForCubesCapacitor = async(options: ScanOptions = {}): Promise<ScanResult> => {
    let shouldStopScan = false
    let scanTimeout

    const stopScan = async() => {
        if (scanTimeout) {
            clearTimeout(scanTimeout)
        }

        scanTimeout = null

        await BleClient.stopLEScan()
    }

    const handleDiscovery = (result: CapacitorScanResult) => {
        try {
            const cube = CubeCapacitor(result.device)

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

        await BleClient.requestLEScan({
            namePrefix: options.namePrefix,
            optionalServices: options.services,
        }, handleDiscovery)

        while (!shouldStopScan) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }

    return {
        promise: startScan(),
        stopScan,
    }
}

export const CubeCapacitor = (device: BleDevice): Cube => {
    const onChange = new jSignal<Cube>()
    const { id, isMultibox } = parseBoxName(device?.name)

    let cube: Cube
    let isConnected: boolean = false

    const handleDisconnect = async(deviceId: string) => {
        isConnected = false
        onChange.dispatch(cube)
    }

    const connect = async(timeout: number = DEFAULT_TIMEOUT_CONNECT) => {
        await BleClient.connect(device?.deviceId, handleDisconnect, { timeout })
        isConnected = true
        onChange.dispatch(cube)
    }

    const disconnect = async(timeout: number = DEFAULT_TIMEOUT_DISCONNECT) => {
        await BleClient.disconnect(device?.deviceId)
        isConnected = false
        onChange.dispatch(cube)
    }

    const getRSSI = async(): Promise<number> => {
        return await BleClient.readRssi(device?.deviceId)
    }

    const read = async(serviceUUID: string, characteristicUUID: string): Promise<DataView> => {
        return await BleClient.read(device?.deviceId, serviceUUID, characteristicUUID)
    }

    const write = async(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void> => {
        await BleClient.write(device?.deviceId, serviceUUID, characteristicUUID, value)
    }

    const listenForNotifications = async(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<DataView>,
    ): Promise<StopNotifications> => {
        await BleClient.startNotifications(device?.deviceId, serviceUUID, characteristicUUID, (value: DataView) => {
            if (typeof listener === 'function') {
                listener(value)
            }
        })

        return () =>
            BleClient.stopNotifications(device?.deviceId, serviceUUID, characteristicUUID)
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
            return device?.deviceId
        },
        get isConnected(): boolean {
            return isConnected
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
