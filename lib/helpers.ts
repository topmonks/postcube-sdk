
import { chunk } from 'lodash'

import { bleErrors } from './errors'

export const getFuture = (hours: number) => {
    const future = new Date()
    future.setHours(future.getHours() + hours)
    return future
}

export const getFutureEpoch = (
    hours: number,
    millisecondPrecision: boolean = false,
) => getFuture(hours).getTime() / (millisecondPrecision ? 1 : 1000)

export const parseSecretCode = (secretCode: string|Iterable<number>): number[] => {
    if (typeof secretCode !== 'string') {
        const buffer: number[] = []

        for (const byte of secretCode) {
            if (byte) {
                buffer.push(byte)
            }
        }

        return buffer
    }

    if (!/^[0-9a-fA-F]{8}$/.test(secretCode)) {
        throw bleErrors.invalidSecretCode()
    }

    return chunk(secretCode, 2).map(byte => parseInt(byte.join(''), 16))
}

export const parsePostCubeName = (name: string): {
    prefix: string
    id: string
    isDev: boolean
    isMultibox: boolean
} => {
    const nameParts = String(name).split(' ')

    if (nameParts.length < 2) {
        throw bleErrors.invalidName()
    }

    if (!~nameParts[0].toLowerCase().indexOf('postcube')) {
        throw bleErrors.invalidName('Invalid prefix')
    }

    let isDev = false
    if (nameParts[1].toLowerCase().trim() === 'devkit') {
        isDev = true
    } else if (!/^\d{6}$/.test(nameParts[1])) {
        throw bleErrors.invalidName('Invalid PostCube ID')
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
        isDev,
        isMultibox,
    }
}
