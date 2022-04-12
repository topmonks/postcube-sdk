
import { Buffer } from 'buffer'

import {
    NONCE,
} from '../constants/bluetooth'
import { doISeriouslyHaveToUseSubtleCrypto } from '../helpers'
import * as chacha20 from './chacha20'
import * as encryptionSubtle from './encryption.subtle'
import * as encryptionNode from './encryption.node'

export interface EncryptionKeys {
    keyIndex?: number
    hashedSecretCode?: Uint8Array
    privateKey?: Uint8Array|number[]
    publicKey?: Uint8Array|number[]
}

export const generateKeyPairV2 = async(): Promise<{
    privateKey: Uint8Array
    publicKey: Uint8Array
}> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return encryptionSubtle.generateKeyPairV2()
    }

    return encryptionNode.generateKeyPairV2()
}

export const cipherV1 = async(encryptionKey: Uint8Array, data: Iterable<number>): Promise<Uint8Array> => {
    return chacha20.encrypt(encryptionKey, NONCE, data)
}

export const decipherV1 = async(encryptionKey: Uint8Array, data: Iterable<number>): Promise<Uint8Array> => {
    const encrypted = await cipherV1(encryptionKey, data)

    return encrypted
}

export const cipherV2 = async(
    encryptionKey: Uint8Array,
    data: Iterable<number>,
    keys: EncryptionKeys,
): Promise<{
    encrypted: Buffer
    authTag: Buffer
}> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return encryptionSubtle.cipherV2(encryptionKey, data, keys)
    }

    return encryptionNode.cipherV2(encryptionKey, data, keys)
}

export const decipherV2 = async(
    encryptionKey: Uint8Array,
    data: Iterable<number>,
    keys: EncryptionKeys,
): Promise<Buffer> => {
    const { encrypted } = await cipherV2(encryptionKey, data, keys)

    return encrypted
}

export const deriveEncryptionKeyV1 = async(privateKey: Uint8Array|number[], publicKey: Uint8Array|number[]): Promise<Uint8Array> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return encryptionSubtle.deriveEncryptionKeyV1(privateKey, publicKey)
    }

    return encryptionNode.deriveEncryptionKeyV1(privateKey, publicKey)
}

export const deriveEncryptionKeyV2 = async(commandId: number, keys: EncryptionKeys): Promise<Uint8Array> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return encryptionSubtle.deriveEncryptionKeyV2(commandId, keys)
    }

    return encryptionNode.deriveEncryptionKeyV2(commandId, keys)
}

export const encryptV1 = async(
    data: Iterable<number>,
    privateKey: Uint8Array|number[],
    publicKey: Uint8Array|number[],
) => {
    const encryptionKey = await deriveEncryptionKeyV1(privateKey, publicKey)

    return cipherV1(encryptionKey, data)
}

export const decryptV1 = async(
    encryptedData: Iterable<number>,
    privateKey: Uint8Array|number[],
    publicKey: Uint8Array|number[],
) => {
    const encryptionKey = await deriveEncryptionKeyV1(privateKey, publicKey)

    return decipherV1(encryptionKey, encryptedData)
}

export const encryptV2 = async(data: Iterable<number>, commandId: number, keys: EncryptionKeys) => {
    const encryptionKey = await deriveEncryptionKeyV2(commandId, keys)

    return cipherV2(encryptionKey, data, keys)
}

export const decryptV2 = async(encryptedData: Iterable<number>, commandId: number, keys: EncryptionKeys) => {
    const encryptionKey = await deriveEncryptionKeyV2(commandId, keys)

    return decipherV2(encryptionKey, encryptedData, keys)
}
