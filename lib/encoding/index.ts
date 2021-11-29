
import * as elliptic from 'elliptic'

import * as protocol from '../../protocol.pb'
import { cubeErrors } from '../errors'
import {
    getFutureEpoch,
    parseSecretCode,
} from '../helpers'
import { hash } from './encryption'
import * as chacha20 from './chacha20'

const secp256k1 = new elliptic.ec('secp256k1')

const generateCommandId = async(options: EncodingOptions): Promise<number> => {
    if (typeof crypto?.getRandomValues === 'function') {
        return crypto.getRandomValues(new Uint32Array(1))[0]
    }

    const { randomBytes } = await import('crypto')
    return randomBytes(4).readUInt32LE(0)
}

export interface EncodingEncryptionKeys {
    keyIndex: number
    privateKey: string|Uint8Array|Buffer|number[]
    publicKey: string|Uint8Array|Buffer|number[]
}

export interface EncodingOptions {
    secretCode?: string|Iterable<number>
    keys?: EncodingEncryptionKeys
}

export const encodeCommand = async(command: Partial<protocol.Packet>, options: EncodingOptions = {}): Promise<DataView> => {
    const commandId = await generateCommandId(options)
    const expireAt = getFutureEpoch(24)

    let encodedPacket = protocol.encodePacket({ ...command, commandId, expireAt })

    if (options.secretCode) {
        const hashedSecret = await hash(
            typeof options.secretCode === 'string' ?
                parseSecretCode(options.secretCode) :
                options.secretCode,
        )

        encodedPacket = protocol.encodeEncryptedPacket({
            hashedSecret,
            payload: encodedPacket,
        })
    }

    if (options.keys) {
        const privateKey = secp256k1.keyFromPrivate(options.keys.privateKey)
        const publicKey = secp256k1.keyFromPublic(options.keys.publicKey)
        const sharedKey = privateKey.derive(publicKey.getPublic())

        const encryptKey = await hash(sharedKey.toArray())
        const nonce = new Uint8Array(12)

        const encryptedPayload: Uint8Array = chacha20.encrypt(encryptKey, nonce, encodedPacket)

        encodedPacket = protocol.encodeEncryptedPacket({
            encryptionKeyId: options.keys.keyIndex,
            payload: encryptedPayload,
        })
    }

    return new DataView(encodedPacket)
}
