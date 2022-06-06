
import { chunk } from 'lodash'
import {
    PostCubeVersion,
    DEPRECATED_SERVICE_UUID,
    DEPRECATED_SERVICE_UUID_16,
    SERVICE_UUID,
    SERVICE_UUID_16,
    SERVICE_UUID_16_BASE_0,
} from './constants/bluetooth'

import { bleErrors } from './errors'

export const uint32ToByteArray = (value: number): number[] => {
    return [
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff,
    ]
}

export const sleep = (timeoutMs: number) => {
    return new Promise(resolve => setTimeout(resolve, timeoutMs))
}

export const withTimeoutRace = async<Result>(
    procedure: (resolve?: (result: Result) => any, reject?: Function) => Result,
    timeoutMs: number,
    timeoutError = bleErrors.timeout('Operation timed out'),
    exitAfterProcedure: boolean = true,
): Promise<Result> => {
    const result = await Promise.race([
        new Promise<Result>(async(resolve, reject) => {
            setTimeout(() => {
                reject(timeoutError)
            }, timeoutMs)
        }),
        new Promise<Result>(async(resolve, reject) => {
            try {
                const result = await procedure(resolve, reject)

                if (exitAfterProcedure) {
                    resolve(result)
                }
            } catch (err) {
                reject(err)
            }
        }),
    ])

    return result
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

export const getFuture = (hours: number) => {
    const future = new Date()
    future.setHours(future.getHours() + hours)
    return future
}

export const getFutureEpoch = (
    hours: number,
    millisecondPrecision: boolean = false,
) => getFuture(hours).getTime() / (millisecondPrecision ? 1 : 1000)

export const generateTimestamp = (useMilliseconds: boolean = false): number[] => {
    return uint32ToByteArray(Math.floor(Date.now() / (useMilliseconds ? 1 : 1000)))
}

export const sanitizePublicKey = (publicKey: Uint8Array) => {
    // Uncompressed format adds 0x04 prefix at the beginning of the public key
    // micro-ecc library accepts public keys without this prefix
    // so remove it here
    if (publicKey.length === 65 && publicKey[0] === 0x04) {
        publicKey = publicKey.slice(1)
    }

    return publicKey
}

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

export const resolveVersionFromAvailableServices = (services: (string|number)[]): PostCubeVersion => {
    for (const service of services) {
        switch (service) {
        case DEPRECATED_SERVICE_UUID:
        case DEPRECATED_SERVICE_UUID_16.toString():
            return PostCubeVersion.v1
        case SERVICE_UUID:
        case SERVICE_UUID_16_BASE_0:
        case SERVICE_UUID_16.toString():
            return PostCubeVersion.v2
        }
    }

    return null
}

export const resolveVersionFromAdvertisingData = (advertising: ArrayBuffer|object): PostCubeVersion => {
    // TODO: Detect (see https://github.com/don/cordova-plugin-ble-central#peripheral-data for more info)
    //       advertising be [ArrayBuffer on Android]
    //       advertising be [object on iOS]

    return null
}

const exprs = {
    '%id_raw%': (value, expr, args) => value.replaceAll(expr, `${args.id}`),
    '%platform_raw%': (value, expr, args) => value.replaceAll(expr, `${args.platform}`),
    '%id%': (value, expr, args) => value.replaceAll(expr, `(ID: ${args.id})`),
    '%platform%': (value, expr, args) => value.replaceAll(expr, `[${args.platform}]`),
    '%id_platform%': (value, expr, args) => value.replaceAll(expr, `PostCube (ID: ${args.id}) [${args.platform}]`),
    '%version%': (value, expr, args) => value.replaceAll(expr, `${args.version || '-'}`),
}

export const templater = (args: {
    id?: string
    platform?: string
    version?: string
}) => {
    return {
        parse(string: string) {
            for (const expr in exprs) {
                string = exprs[expr](string, expr, args)
            }

            return string
        },
    }
}
