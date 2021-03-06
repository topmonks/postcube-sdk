
import { Buffer } from 'buffer'

import type { EncryptionKeys } from './encryption'
import {
    NONCE,
    AUTH_TAG_SIZE,
} from '../constants/bluetooth'
import { sanitizePublicKey } from '../helpers'
import { hashSHA256, hashSharedSecret } from './hash'

export const generateKeyPairV2 = async(): Promise<{
    privateKey: Uint8Array
    publicKey: Uint8Array
}> => {
    const crypto = await import('crypto')

    const curve = await crypto.createECDH('prime256v1')

    const publicKeyBuffer = await curve.generateKeys(undefined, 'uncompressed') as any
    const publicKey = await sanitizePublicKey(publicKeyBuffer)

    const privateKey = new Uint8Array(curve.getPrivateKey())

    return { privateKey, publicKey }
}

export const cipherV2 = async(
    encryptionKey: Uint8Array,
    data: Iterable<number>,
    keys: EncryptionKeys,
): Promise<{
    encrypted: Buffer
    authTag: Buffer
}> => {
    const hashedSecretCodeBuffer = Buffer.from(keys.hashedSecretCode)

    const crypto = await import('crypto')

    const cipher = await crypto.createCipheriv(
        'chacha20-poly1305',
        encryptionKey,
        NONCE,
        { authTagLength: AUTH_TAG_SIZE },
    )

    cipher.setAAD(hashedSecretCodeBuffer, {
        plaintextLength: hashedSecretCodeBuffer.length,
    })

    const encrypted = cipher.update(new Uint8Array(data))
    cipher.final()

    return {
        encrypted,
        authTag: cipher.getAuthTag(),
    }
}

export const deriveEncryptionKeyV1 = async(privateKey: Uint8Array|number[], publicKey: Uint8Array|number[]): Promise<Uint8Array> => {
    const crypto = await import('crypto')

    const curve = await crypto.createECDH('secp256k1')
    curve.setPrivateKey(Buffer.from(privateKey))

    const sharedSecret = await curve.computeSecret(Buffer.from(publicKey))

    return hashSHA256(sharedSecret)
}

export const deriveEncryptionKeyV2 = async(commandId: number, keys: EncryptionKeys): Promise<Uint8Array> => {
    const publicKey =
        keys?.publicKey?.length === 64 ?
            [ 0x04, ...keys.publicKey ] :
            keys.publicKey

    const crypto = await import('crypto')

    const curve = await crypto.createECDH('prime256v1')
    curve.setPrivateKey(Buffer.from(keys.privateKey))

    const sharedSecret = await curve.computeSecret(Buffer.from(publicKey))

    return hashSharedSecret(commandId, sharedSecret)
}
