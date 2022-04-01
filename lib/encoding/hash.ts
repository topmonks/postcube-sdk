
import { Buffer } from 'buffer'
import { chunk } from 'lodash'

import { doISeriouslyHaveToUseSubtleCrypto } from '../helpers'

export const hashSHA256 = async(data: Iterable<number>): Promise<Uint8Array> => {
    const buffer = new Uint8Array(data)

    if (doISeriouslyHaveToUseSubtleCrypto()) {
        const result = await window.crypto.subtle.digest('SHA-256', buffer)
        return new Uint8Array(result)
    }

    const cryptoNode = await import('crypto')

    const digestedHash = cryptoNode
        .createHash('sha256')
        .update(buffer)
        .digest('hex')

    const hashBuffer = chunk(digestedHash, 2)
        .map(byte => parseInt(byte.join(''), 16))

    return new Uint8Array(hashBuffer)
}

export const hashSharedSecret = async(commandId: number, sharedSecret: ArrayBuffer) => {
    return hashSHA256([
        0xff & (commandId >> 24),
        0xff & (commandId >> 16),
        0xff & (commandId >> 8),
        0xff & commandId,
        ...Buffer.from(sharedSecret),
    ])
}
