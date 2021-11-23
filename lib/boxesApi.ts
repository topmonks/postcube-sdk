
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

export const splitCommand = (buffer: Uint8Array, chunkSize: number = 20): Uint8Array[] => {
    const chunks: Uint8Array[] = []

    let offset = 0
    while (offset < buffer.length) {
        chunks.push(buffer.subarray(offset, offset + chunkSize))
        offset += chunkSize
    }

    return chunks
}

export const writeToCharacteristic = async(characteristic: BluetoothRemoteGATTCharacteristic, buffer: number[]|Uint8Array) => {
    const chunks = splitCommand(
        buffer instanceof Uint8Array ?
            buffer :
            new Uint8Array(buffer),
        20,
    )

    for (const index in chunks) {
        const chunk = chunks[index]
        await characteristic.writeValue(chunk)
    }
}

export const parseResult = (response: DataView, charUUID: string): number => {
    return response.getUint8(BOX_CHAR_RESULTS_INDEX[charUUID])
}

export const parseResponseMessage = (code: number) => {
    return BOX_RESPONSE_MESSAGES[code] || code
}

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




// async() => {
//     const device = await navigator.bluetooth.requestDevice({})
//     const pser = await device.gatt.getPrimaryService('')
//     const char = await pser.getCharacteristic('')
//     char.addEventListener('characteristicvaluechanged', (event) => {
//         const chara: BluetoothRemoteGATTCharacteristic// = event.target
//         chara.value
//     })
// }
