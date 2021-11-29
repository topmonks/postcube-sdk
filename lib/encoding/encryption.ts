
import { chunk } from 'lodash'

export const hash = async(data: Iterable<number>) => {
    const buffer = new Uint8Array(data)

    if (typeof crypto?.subtle?.digest === 'function') {
        const result = await crypto.subtle.digest('SHA-256', buffer)
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
