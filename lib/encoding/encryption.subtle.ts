
import type { EncryptionKeys } from './encryption'
import {
    NONCE,
} from '../constants/bluetooth'
import { rfc5915KeyAsn, pkcs8KeyAsn } from '../constants/encoding'
import { sanitizePublicKey } from '../helpers'
import { hashSharedSecret } from './hash'

const parsePrivateSubtleCryptoKey = async(privateKey: Iterable<number>, publicKey: Iterable<number>) => {
    const algorithm = {
        name: 'ECDH',
        namedCurve: 'P-256',
    }

    const pkcs8KeyBuffer = await parseRawPrivateKey(
        new Uint8Array(privateKey),
        new Uint8Array(publicKey),
    )

    return await window.crypto.subtle.importKey('pkcs8', pkcs8KeyBuffer, algorithm, true, [ 'encrypt', 'decrypt', 'deriveKey', 'deriveBits' ])
}

const parsePublicSubtleCryptoKey = async(data: Uint8Array|number[]) => {
    const keyBuffer = new Uint8Array(data)
    const algorithm = {
        name: 'ECDH',
        namedCurve: 'P-256',
    }

    return await window.crypto.subtle.importKey('raw', keyBuffer, algorithm, true, [ 'encrypt', 'decrypt', 'deriveKey', 'deriveBits' ])
}

const parsePkcs8PrivateKey = (pkcs8KeyBuffer: ArrayBuffer): Uint8Array => {
    const decodedKey = pkcs8KeyAsn.decode(Buffer.from(pkcs8KeyBuffer), 'der')
    const { privateKey } = rfc5915KeyAsn.decode(decodedKey.privateKey, 'der')

    return new Uint8Array(privateKey)
}

const parseRawPrivateKey = (privateKeyBuffer: Uint8Array, publicKeyBuffer: Uint8Array): ArrayBuffer => {
    const encodedRfc5915Key = rfc5915KeyAsn.encode({
        version: 1,
        privateKey: Buffer.from(privateKeyBuffer),
        publicKey: {
            unused: 0,
            data: Buffer.from(publicKeyBuffer),
        },
    })

    const pkcs8KeyBuffer = pkcs8KeyAsn.encode({
        version: 0,
        algorithmIdentifier: {
            privateKeyType: 'EC',
            parameters: 'prime256v1',
        },
        privateKey: Buffer.from(encodedRfc5915Key),
    })

    return new Uint8Array(pkcs8KeyBuffer)
}

export const generateKeyPair = async(): Promise<{
    privateKey: Uint8Array
    publicKey: Uint8Array
}> => {
    const cryptoKeyPair = await window.crypto.subtle.generateKey({
        name: 'ECDH',
        namedCurve: 'P-256',
    }, true, [ 'deriveKey', 'deriveBits' ])

    const privateKeyPkcs8 = await window.crypto.subtle.exportKey('pkcs8', cryptoKeyPair.privateKey)
    const privateKey = await parsePkcs8PrivateKey(privateKeyPkcs8)

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
