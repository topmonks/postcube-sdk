
import * as elliptic from 'elliptic'

import * as protocol from '../protocol.pb'
import { bleErrors } from '../errors'
import {
    PACKET_SIZE,
} from '../constants/bluetooth'
import {
    getFutureEpoch,
    parseSecretCode,
} from '../helpers'
import { hash } from './encryption'
import * as chacha20 from './chacha20'

const NONCE = new Uint8Array(12)

const secp256k1 = new elliptic.ec('secp256k1')

const generateCommandId = async(options: EncodingOptions): Promise<number> => {
    if (typeof crypto?.getRandomValues === 'function') {
        return crypto.getRandomValues(new Uint32Array(1))[0]
    }

    const { randomBytes } = await import('crypto')
    return randomBytes(4).readUInt32LE(0)
}

const deriveEncryptionKey = async(keys: EncryptionKeys): Promise<Uint8Array> => {
    const privateKey = secp256k1.keyFromPrivate(keys.privateKey)
    const publicKey = secp256k1.keyFromPublic(keys.publicKey)
    const sharedKey = privateKey.derive(publicKey.getPublic())

    return await hash(sharedKey.toArray())
}

export interface EncryptionKeys {
    keyIndex?: number
    privateKey?: Uint8Array|number[]
    publicKey?: Uint8Array|number[]
}

export interface EncodingOptions {
    secretCode?: string|Iterable<number>
    keys?: EncryptionKeys
}

export const encodeCommand = async(command: Partial<protocol.Packet>, options: EncodingOptions = {}): Promise<Uint8Array> => {
    const commandId = await generateCommandId(options)
    const expireAt = getFutureEpoch(24)

    let encodedPacket: Uint8Array = protocol.encodePacket({ ...command, commandId, expireAt })

    if (options.secretCode) {
        const hashedSecret = await hash(parseSecretCode(options.secretCode))

        encodedPacket = protocol.encodeEncryptedPacket({
            hashedSecret,
            payload: encodedPacket,
        })
    }

    if (options.keys) {
        const encryptionKey = await deriveEncryptionKey(options.keys)
        const encryptedPayload: Uint8Array = chacha20.encrypt(encryptionKey, NONCE, encodedPacket)

        encodedPacket = protocol.encodeEncryptedPacket({
            encryptionKeyId: options.keys.keyIndex,
            payload: encryptedPayload,
        })
    }

    return encodedPacket
}

export const encodeResult = async(commandId: number, value?: number, errorCode?: number): Promise<Uint8Array> => {
    const encodedResult = await protocol.encodeResult({ commandId, value, errorCode })
    return encodedResult
}

export const chunkBuffer = async(buffer: ArrayBufferLike): Promise<DataView[]> => {
    const chunks: DataView[] = []

    for (let index = 0; index < buffer.byteLength; index += PACKET_SIZE - 1) {
        const chunk = new Uint8Array(PACKET_SIZE)

        chunk.set([ Number(index + PACKET_SIZE - 1 < buffer.byteLength) ], 0)
        chunk.set(new Uint8Array(buffer.slice(index, index + PACKET_SIZE - 1)), 1)

        chunks.push(new DataView(chunk.buffer))
    }

    return chunks
}

export const parseBufferChunk = async(chunk: DataView): Promise<{
    buffer: number[]
    isLast: boolean
}> => {
    const buffer: number[] = []
    const isLast = !chunk.getUint8(0)

    for (let offset = 1; offset < PACKET_SIZE; offset++) {
        if (offset === chunk.byteLength) {
            break
        }

        buffer.push(chunk.getUint8(offset))
    }

    return { buffer, isLast }
}

export const decodeChunkedResult = async(chunks: number[][]): Promise<protocol.Result> => {
    const buffer = chunks.reduce((buffer, chunk) => [ ...chunk, ...buffer ], [])
    const encodedCommand = new Uint8Array(buffer)

    return await protocol.decodeResult(encodedCommand)
}

const decodeEncryptedPacket = async(buffer: Uint8Array): Promise<[ protocol.EncryptedPacket, protocol.Packet ]> => {
    let encryptedPacket: protocol.EncryptedPacket

    try {
        encryptedPacket = await protocol.decodeEncryptedPacket(buffer)

        if (typeof encryptedPacket.encryptionKeyId !== 'number' && !encryptedPacket.hashedSecret) {
            throw bleErrors.invalidCommand('EncryptedPacket must contain either encryptionKeyId or hashedSecret')
        }
    } catch (err) {
        try {
            const packet = await protocol.decodePacket(buffer)

            if (!packet.commandId || !packet.expireAt) {
                throw Error()
            }

            return [ encryptedPacket, packet ]
        } catch (_err) { throw err }
    }

    return [ encryptedPacket, null ]
}

export const decodeChunkedPacket = async(chunks: number[][], options: EncodingOptions = {}): Promise<protocol.Packet> => {
    const buffer = chunks.reduce((buffer, chunk) => [ ...chunk, ...buffer ], [])
    const [ encryptedPacket, packet ] = await decodeEncryptedPacket(new Uint8Array(buffer))

    if (packet) {
        return packet
    }

    if (encryptedPacket.hashedSecret) {
        const hashedSecret = await hash(parseSecretCode(options.secretCode))

        if (hashedSecret.length !== encryptedPacket.hashedSecret.length) {
            throw bleErrors.invalidSecretCode()
        }

        for (let offset = 0; offset < hashedSecret.length; offset++) {
            if (encryptedPacket.hashedSecret[offset] !== hashedSecret[offset]) {
                throw bleErrors.invalidSecretCode()
            }
        }

        const packet = await protocol.decodePacket(encryptedPacket.payload)
        return packet
    }

    if (encryptedPacket.encryptionKeyId !== options.keys.keyIndex) {
        throw bleErrors.invalidKeys('Unknown encryption key id')
    }

    const encryptionKey = await deriveEncryptionKey(options.keys)
    const encodedPacket: Uint8Array = chacha20.decrypt(encryptionKey, NONCE, encryptedPacket.payload)

    return await protocol.decodePacket(encodedPacket)
}
