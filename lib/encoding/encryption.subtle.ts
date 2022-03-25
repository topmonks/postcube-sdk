
import type { EncryptionKeys } from './encryption'
import {
    NONCE,
} from '../constants/bluetooth'
import { sanitizePublicKey } from '../helpers'
import { hashSharedSecret } from './hash'

const parsePrivateSubtleCryptoKey = async(privateKey: Iterable<number>, publicKey: Iterable<number>) => {
    const algorithm = {
        name: 'ECDH',
        namedCurve: 'P-256',
    }

    const privateKeyData = await parseRawPrivateKeyData(
        new Uint8Array(privateKey),
        new Uint8Array(publicKey),
    )

    return await window.crypto.subtle.importKey('jwk', privateKeyData, algorithm, true, [ 'encrypt', 'decrypt', 'deriveKey', 'deriveBits' ])
}

const parsePublicSubtleCryptoKey = async(data: Uint8Array|number[]) => {
    const keyBuffer = new Uint8Array(data)
    const algorithm = {
        name: 'ECDH',
        namedCurve: 'P-256',
    }

    return await window.crypto.subtle.importKey('raw', keyBuffer, algorithm, true, [ 'encrypt', 'decrypt', 'deriveKey', 'deriveBits' ])
}

const parseRawPrivateKeyData = (privateKeyBuffer: Uint8Array, publicKeyBuffer: Uint8Array) => {
    const privateKeyBase64 = Buffer.from(privateKeyBuffer).toString('base64url')

    const _publicKeyBuffer = sanitizePublicKey(publicKeyBuffer)

    const x = Buffer.from(_publicKeyBuffer.slice(0, 32))
    const y = Buffer.from(_publicKeyBuffer.slice(32, 64))

    return {
        kty: 'EC',
        crv: 'P-256',
        key_ops: [ 'deriveKey', 'deriveBits' ],
        ext: true,
        d: privateKeyBase64,
        x: x.toString('base64url'),
        y: y.toString('base64url'),
    }
}

export const generateKeyPair = async(): Promise<{
    privateKey: Uint8Array
    publicKey: Uint8Array
}> => {
    const cryptoKeyPair = await window.crypto.subtle.generateKey({
        name: 'ECDH',
        namedCurve: 'P-256',
    }, true, [ 'deriveKey', 'deriveBits' ])

    const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', cryptoKeyPair.privateKey)
    const privateKey = new Uint8Array(Buffer.from(privateKeyJwk.d, 'base64url'))

    const publicKeyBuffer = await window.crypto.subtle.exportKey('raw', cryptoKeyPair.publicKey)
    const publicKey = await sanitizePublicKey(new Uint8Array(publicKeyBuffer))

    return { privateKey, publicKey }
}

export const cipher = async(
    encryptionKey: Uint8Array,
    data: Iterable<number>,
    keys: EncryptionKeys,
): Promise<{
    encrypted: Buffer
    authTag: Buffer
}> => {
    const { createCipher } = await import('chacha')

    const hashedSecretCodeBuffer = Buffer.from(keys.hashedSecretCode)

    const cipher = await createCipher(encryptionKey, NONCE)

    cipher.setAAD(hashedSecretCodeBuffer)

    const encrypted = cipher.update(new Uint8Array(data))
    cipher.final()

    return {
        encrypted,
        authTag: cipher.getAuthTag(),
    }
}

export const deriveEncryptionKey = async(commandId: number, keys: EncryptionKeys): Promise<Uint8Array> => {
    const publicKey =
        keys?.publicKey?.length === 64 ?
            [ 0x04, ...keys.publicKey ] :
            keys.publicKey

    const privateCryptoKey = await parsePrivateSubtleCryptoKey(keys.privateKey, publicKey)
    const publicCryptoKey = await parsePublicSubtleCryptoKey(publicKey)

    const derivedKey = await window.crypto.subtle.deriveBits({
        name: 'ECDH',
        public: publicCryptoKey,
    }, privateCryptoKey, 8 * 32)

    return hashSharedSecret(commandId, derivedKey)
}
