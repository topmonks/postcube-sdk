
import { chunk } from 'lodash'

import { BOX_CHAR_RESULTS_INDEX } from './constants/bluetooth'
import { cubeErrors } from './errors'

export const getFuture = (hours: number) => {
    const future = new Date()
    future.setHours(future.getHours() + hours)
    return future
}

export const getFutureEpoch = (
    hours: number,
    millisecondPrecision: boolean = false,
) => getFuture(hours).getTime() / (1 + Number(!millisecondPrecision) * 999)

export const parseSecretCode = (secretCode: string) => {
    if (!/^[0-9a-fA-F]{8}$/.test(secretCode)) {
        throw cubeErrors.invalidSecretCode()
    }

    return chunk(secretCode, 2).map(byte => parseInt(byte.join(''), 16))
}

export const parseResultValue = (value: DataView, characteristicUUID: string): number => {
    return value.getInt8(BOX_CHAR_RESULTS_INDEX[characteristicUUID])
}

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
