
import {
    BOX_CHAR_RESULTS_INDEX,
    BOX_RESPONSE_MESSAGES,
} from './constants/bluetooth'
import { cubeErrors } from './errors'

export const parseBoxName = (name: string): {
    prefix: string
    id: string
    isMultibox: boolean
} => {
    const nameParts = String(name).split(' ')

    if (nameParts.length < 2) {
        throw cubeErrors.invalidName()
    }

    if (!~nameParts[0].toLowerCase().indexOf('postcube')) {
        throw cubeErrors.invalidName('Invalid prefix')
    }

    if (!/^\d{6}$/.test(nameParts[1])) {
        throw cubeErrors.invalidName('Invalid PostCube ID')
    }

    let isMultibox = false
    if (nameParts[2] && ~nameParts[2].toLowerCase().indexOf('multibox')) {
        isMultibox = true
    }

    return {
        prefix: nameParts[0] ?
            nameParts[0] : null,
        id: nameParts[1] ?
            nameParts[1] : null,
        isMultibox,
    }
}

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
