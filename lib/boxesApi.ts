
import { jSignal } from 'jsignal'

import { boxErrors } from './errors'
import {
    SERVICE_UUID,
    SERVICE_UUID_16,
    CHAR_RESULT_UUID,
    CHAR_UNLOCK_UUID,
    BOX_CHAR_RESULTS_INDEX,
    BOX_RESPONSE_MESSAGES,
    BOX_RES_OK,
} from './constants/bluetooth'
import {
    splitCommand,
    writeToCharacteristic,
    parseResult,
    parseResponseMessage,
} from './helpers'

export interface ScanBoxesResult {
    promise: Promise<void>
    cancel(): void
}

export interface BoxesAPI {
    readonly onChange: jSignal<BoxesAPI>
    readonly foundBoxes: BluetoothDevice[]
    readonly isScanning: boolean
    readonly isConnecting: boolean
    readonly isConnected: boolean
    readonly connectedBox: BluetoothDevice

    isAvailable(): Promise<boolean>
    isEnabled(): Promise<boolean>
    findBox(namePrefix: string): Promise<BluetoothDevice>
    scanBoxes(): Promise<ScanBoxesResult>
    connect(box: BluetoothDevice): Promise<BluetoothDevice>
    disconnect(): Promise<void>
}

let foundBoxes: BluetoothDevice[] = []
let isScanning: boolean
let isConnecting: boolean
let connectedBox: BluetoothDevice

const updateState = async(update: () => any) => {
    await update()
    BoxesAPI.onChange.dispatch(BoxesAPI)
}

const isAvailable = async(): Promise<boolean> => {
    return !!navigator.bluetooth
}

const isEnabled = async(): Promise<boolean> => {
    if (await isAvailable()) {
        return navigator.bluetooth.getAvailability()
    }

    return false
}

const ensureEnabled = async() => {
    if (!await isAvailable()) {
        throw boxErrors.bluetoothUnavailable()
    }

    if (!await isEnabled()) {
        throw boxErrors.bluetoothDisabled()
    }
}

const findBox = async(namePrefix: string): Promise<BluetoothDevice> => {
    await ensureEnabled()

    const filters = [{
        namePrefix,
        services: [SERVICE_UUID_16],
    }]

    return await navigator.bluetooth.requestDevice({
        filters,
        acceptAllDevices: false,
        optionalServices: [
            SERVICE_UUID,
            'battery_service',
        ],
    })
}

const scanBoxes = async(): Promise<ScanBoxesResult> => {
    await ensureEnabled()

    let killScan = false
    const runScan = async() => {
        updateState(() => {
            isScanning = true
        })

        while (!killScan) {
            console.log('Scanning for boxes...')

            updateState(() => {
                foundBoxes = []
            })

            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        updateState(() => {
            isScanning = false
        })
    }

    return {
        promise: runScan(),
        cancel() {
            killScan = true
        },
    }
}

const connect = async(box: BluetoothDevice): Promise<BluetoothDevice> => {
    await ensureEnabled()

    updateState(() => {
        isConnecting = true
    })

    const gattServer = await box.gatt.connect()

    updateState(() => {
        isConnecting = false
        connectedBox = gattServer?.device
    })

    return connectedBox
}

const disconnect = async() => {
    if (typeof connectedBox?.gatt?.disconnect === 'function') {
        await connectedBox.gatt.disconnect()
    }

    updateState(() => {
        connectedBox = null
    })
}

export const BoxesAPI: BoxesAPI = {
    onChange: new jSignal(),
    get foundBoxes(): BluetoothDevice[] {
        return foundBoxes
    },
    get isScanning(): boolean {
        return isScanning
    },
    get isConnecting(): boolean {
        return isConnecting
    },
    get isConnected(): boolean {
        return (
            !!connectedBox
            && connectedBox?.gatt?.connected
        )
    },
    get connectedBox(): BluetoothDevice {
        return connectedBox
    },
    isAvailable,
    isEnabled,
    findBox,
    scanBoxes,
    connect,
    disconnect,
}
