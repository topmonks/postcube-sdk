
import { chunk } from 'lodash'
import { DEPRECATED_SERVICE_UUID, DEPRECATED_SERVICE_UUID_16, PostCubeVersion, SERVICE_UUID, SERVICE_UUID_16, SERVICE_UUID_16_FULL_WITH_BASE_FUCK_ME } from './constants/bluetooth'

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

export const uint32ToByteArray = (value: number): number[] => {
    return [
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff,
    ]
}

export const generateTimestamp = (useMilliseconds: boolean = false): number[] => {
    return uint32ToByteArray(Math.floor(Date.now() / (useMilliseconds ? 1 : 1000)))
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

export const resolveVersionFromAvailableServices = (services: (string|number)[]): PostCubeVersion => {
    for (const service of services) {
        switch (service) {
        case DEPRECATED_SERVICE_UUID:
        case DEPRECATED_SERVICE_UUID_16.toString():
            return PostCubeVersion.v1
        case SERVICE_UUID:
        case SERVICE_UUID_16_FULL_WITH_BASE_FUCK_ME:
        case SERVICE_UUID_16.toString():
            return PostCubeVersion.v2
        }
    }

    return null
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
