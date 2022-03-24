
import { chunk } from 'lodash'

import { bleErrors } from './errors'

export const sanitizePublicKey = (publicKey: Uint8Array) => {
    // Uncompressed format adds 0x04 prefix at the beginning of the public key
    // micro-ecc library accepts public keys without this prefix
    // so remove it here
    if (publicKey.length === 65 && publicKey[0] === 0x04) {
        publicKey = publicKey.slice(1)
    }

    return publicKey
}

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

    return {
        prefix: nameParts[0] ?
            nameParts[0] : null,
        id: nameParts[1] ?
            nameParts[1] : null,
        isDev,
    }
}

export const doISeriouslyHaveToUseSubtleCrypto = () => {
    return (
        typeof window !== 'undefined'
        && typeof window?.crypto?.getRandomValues     === 'function'
        && typeof window?.crypto?.subtle?.digest      === 'function'
        && typeof window?.crypto?.subtle?.generateKey === 'function'
        && typeof window?.crypto?.subtle?.encrypt     === 'function'
        && typeof window?.crypto?.subtle?.deriveBits  === 'function'
        && typeof window?.crypto?.subtle?.importKey   === 'function'
        && typeof window?.crypto?.subtle?.exportKey   === 'function'
    )
}
