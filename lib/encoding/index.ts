
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

const secp256k1 = new elliptic.ec('secp256k1')

const generateCommandId = async(options: EncodingOptions): Promise<number> => {
    if (typeof crypto?.getRandomValues === 'function') {
        return crypto.getRandomValues(new Uint32Array(1))[0]
    }

    const { randomBytes } = await import('crypto')
    return randomBytes(4).readUInt32LE(0)
}

export interface EncryptionKeys {
    keyIndex: number
    privateKey: string|Uint8Array|Buffer|number[]
    publicKey: string|Uint8Array|Buffer|number[]
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

    return encodedPacket
}

export const chunkCommand = async(command: ArrayBufferLike): Promise<DataView[]> => {
    const chunks: DataView[] = []

    for (let index = 0; index < command.byteLength; index += PACKET_SIZE - 1) {
        const buffer = new Uint8Array(PACKET_SIZE)

        const hasMoreChunks = index + PACKET_SIZE - 1 < command.byteLength
        buffer.set([ Number(hasMoreChunks) ], 0)

        const chunk = new Uint8Array(command.slice(index, index + PACKET_SIZE - 1))

        // buffer.set(chunk, 1) // for 0x0 padding at the end of chunk
        buffer.set(chunk, hasMoreChunks ? 1 : PACKET_SIZE - chunk.byteLength) // for 0x0 padding between 

        chunks.push(new DataView(chunk.buffer))
    }

    return chunks
}

export const parseResultChunk = async(chunk: DataView): Promise<{
    buffer: number[]
    isLast: boolean
}> => {
    const isLast = !chunk.getUint8(0)
    const buffer: number[] = []

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
