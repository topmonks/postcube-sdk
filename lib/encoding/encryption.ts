

import { doISeriouslyHaveToUseSubtleCrypto } from '../helpers'
import {
    generateKeyPair as generateKeyPairSubtle,
    cipher as cipherSubtle,
    deriveEncryptionKey as deriveEncryptionKeySubtle,
} from './encryption.subtle'
import {
    generateKeyPair as generateKeyPairNode,
    cipher as cipherNode,
    deriveEncryptionKey as deriveEncryptionKeyNode,
} from './encryption.node'

export interface EncryptionKeys {
    keyIndex?: number
    hashedSecretCode?: Uint8Array
    privateKey?: Uint8Array|number[]
    publicKey?: Uint8Array|number[]
}

export const generateKeyPair = async(): Promise<{
    privateKey: Uint8Array
    publicKey: Uint8Array
}> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return generateKeyPairSubtle()
    }

    return generateKeyPairNode()
}

export const cipher = async(
    encryptionKey: Uint8Array,
    data: Iterable<number>,
    keys: EncryptionKeys,
): Promise<{
    encrypted: Buffer
    authTag: Buffer
}> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return cipherSubtle(encryptionKey, data, keys)
    }

    return cipherNode(encryptionKey, data, keys)
}

export const decipher = async(
    encryptionKey: Uint8Array,
    data: Iterable<number>,
    keys: EncryptionKeys,
): Promise<{ decrypted: Buffer }> => {
    const { encrypted } = await cipher(encryptionKey, data, keys)

    return { decrypted: encrypted }
}

export const deriveEncryptionKey = async(commandId: number, keys: EncryptionKeys): Promise<Uint8Array> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return deriveEncryptionKeySubtle(commandId, keys)
    }

    return deriveEncryptionKeyNode(commandId, keys)
}

export const encrypt = async(data: Iterable<number>, commandId: number, keys: EncryptionKeys) => {
    const encryptionKey = await deriveEncryptionKey(commandId, keys)

    return cipher(encryptionKey, data, keys)
}

export const decrypt = async(encryptedData: Iterable<number>, commandId: number, keys: EncryptionKeys) => {
    const encryptionKey = await deriveEncryptionKey(commandId, keys)

    return decipher(encryptionKey, encryptedData, keys)
}
