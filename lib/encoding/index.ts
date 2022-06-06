
import { Buffer } from 'buffer'

import * as protocol from '../protocol.pb'
import { bleErrors } from '../errors'
import {
    MAX_PACKET_SIZE,
    NONCE,
    PACKET_LAST_INDEX,
    PACKET_LAST_TRUE,
    PACKET_LAST_FALSE,
    DEPRECATED_CHAR_RESULTS_INDEX,
    BOX_MAGIC,
} from '../constants/bluetooth'
import { PostCubeLogger } from '../logger'
import {
    getFutureEpoch,
    parseSecretCode,
    uint32ToByteArray,
} from '../helpers'
import { hashSHA256 } from './hash'
import {
    EncryptionKeys,
    encryptV2,
    decryptV2,
    encryptV1,
} from './encryption'
import { generateCommandId } from './command'

export type { EncryptionKeys }

export enum CommandType {
    setKey   = 'setKey',
    unlock   = 'unlock',
    timeSync = 'timeSync',
    nuke     = 'nuke',
    protect  = 'protect',
}

export interface CommandMap {
    [CommandType.setKey]:   protocol.SetKey
    [CommandType.unlock]:   protocol.Unlock
    [CommandType.timeSync]: protocol.TimeSync
    [CommandType.nuke]:     protocol.Nuke
    [CommandType.protect]:  protocol.Protect
}

export type Command = {
    [K in keyof CommandMap]-?: Required<Pick<CommandMap, K>> & Partial<Pick<CommandMap, Exclude<keyof CommandMap, K>>>;
}[keyof CommandMap]

export enum EncodingEncryptionStrategy {
    secretCode = 'secretcode',
    key        = 'key',
}

export interface EncodingOptions {
    commandId?: number
    expireAt?: number
    boxId?: string|Iterable<number>
    secretCode?: string|Iterable<number>
    keys?: EncryptionKeys
    encryptionStrategy?: EncodingEncryptionStrategy
}

export const splitCommandV1 = async(buffer: Uint8Array, chunkSize: number = MAX_PACKET_SIZE): Promise<Uint8Array[]> => {
    const result: Uint8Array[] = []

    for (let offset = 0; offset < buffer.length; offset += chunkSize) {
        result.push(buffer.subarray(offset, offset + chunkSize))
    }

    return result
}

export const parseResultV1 = async(response: DataView|ArrayBuffer, characteristicUUID: string|number) => {
    const buffer = new Uint8Array(
        response instanceof Buffer ?
            response.buffer :
            response as ArrayBuffer,
    )

    const index = DEPRECATED_CHAR_RESULTS_INDEX[characteristicUUID.toString()]
    return buffer[index]
}

export const createCommandV1 = async(
    privateKey: Uint8Array,
    publicKey: Uint8Array,
    expireAt: number = new Date().getTime() + 60000,
    payload: Iterable<number> = [],
) => {
    const commandId = await generateCommandId()
    const data = new Uint8Array([
        ...uint32ToByteArray(commandId),
        ...uint32ToByteArray(BOX_MAGIC),
        ...uint32ToByteArray(expireAt),
        ...payload,
    ])

    const encrypted = await encryptV1(data, privateKey, publicKey)

    return encrypted
}

const resolveEncryptionStrategyV2 = (options: EncodingOptions): EncodingEncryptionStrategy => {
    if (!!options?.encryptionStrategy) {
        return options.encryptionStrategy
    }

    if (
        !!options?.keys?.hashedSecretCode
        && typeof options?.keys?.keyIndex === 'number'
        && !!options?.keys?.privateKey
        && !!options?.keys?.publicKey
    ) {
        return EncodingEncryptionStrategy.key
    }

    if (!!options?.keys?.hashedSecretCode) {
        return EncodingEncryptionStrategy.secretCode
    }

    return null
}

const resolveCommandTypeV2 = (command: Command): CommandType => {
    switch (true) {
    case typeof command[CommandType.setKey]   === 'object': return CommandType.setKey
    case typeof command[CommandType.unlock]   === 'object': return CommandType.unlock
    case typeof command[CommandType.timeSync] === 'object': return CommandType.timeSync
    case typeof command[CommandType.nuke]     === 'object': return CommandType.nuke
    case typeof command[CommandType.protect]  === 'object': return CommandType.protect
    }

    return null
}

const validateCommandV2 = (command: Command, existingCommand: CommandType) => {
    if (!existingCommand) {
        throw bleErrors.invalidCommand('Empty command')
    }

    const commandDuplicate = Object.assign({}, command)
    delete commandDuplicate[existingCommand]

    if (!!resolveCommandTypeV2(commandDuplicate)) {
        throw bleErrors.invalidCommand('Command must specify exactly 1 action (setKey/unlock/timeSync/nuke/protect)')
    }
}

export const encodeCommandV2 = async(command: Command, options: EncodingOptions = {}): Promise<Uint8Array> => {
    const commandId = options?.commandId || await generateCommandId()
    const expireAt = options?.expireAt || await getFutureEpoch(24)

    const commandType = await resolveCommandTypeV2(command)

    await validateCommandV2(command, commandType)

    let encodedPacket: Uint8Array = await protocol.encodePacket({ expireAt, ...command })

    if (!!options.boxId && !!options.secretCode) {
        const payload = [
            ...(typeof options.boxId === 'string' ?
                Buffer.from(options.boxId, 'utf-8') :
                options.boxId),
            ...parseSecretCode(options.secretCode),
        ]

        options.keys = options.keys || {}
        options.keys.hashedSecretCode = await hashSHA256(payload)
    }

    const encryptionStrategy: EncodingEncryptionStrategy = await resolveEncryptionStrategyV2(options)

    if (encryptionStrategy === EncodingEncryptionStrategy.secretCode && commandType !== CommandType.setKey) {
        throw bleErrors.invalidAuthentication('Secret code can be used exclusively with `setKey` command')
    }

    if (encryptionStrategy) {
        const encryptedPacketPayload: protocol.EncryptedPacket = { commandId }

        switch (encryptionStrategy) {
        case EncodingEncryptionStrategy.secretCode:
            encryptedPacketPayload.hash = options.keys.hashedSecretCode
            encryptedPacketPayload.payload = encodedPacket
            break
        case EncodingEncryptionStrategy.key:
            const { encrypted, authTag } = await encryptV2(encodedPacket, commandId, options.keys)

            encryptedPacketPayload.encryptionKeyId = options.keys.keyIndex
            encryptedPacketPayload.payload = encrypted
            break
        }

        encodedPacket = await protocol.encodeEncryptedPacket(encryptedPacketPayload)
    }

    if (encodedPacket.length > 255) {
        throw bleErrors.invalidCommandTooLarge()
    }

    return new Uint8Array(Buffer.from(encodedPacket))
}

export const encodeResultV2 = async(commandId: number, value?: number, errorCode?: number): Promise<Uint8Array> => {
    return protocol.encodeResult({ commandId, value, errorCode })
}

export const chunkBufferV2 = async(buffer: ArrayBufferLike): Promise<DataView[]> => {
    const chunks: DataView[] = []

    for (let cursor = 0; cursor < buffer.byteLength; cursor += MAX_PACKET_SIZE - 1) {
        const nextIndex = cursor + MAX_PACKET_SIZE - 1
        const nextCursor = Math.min(buffer.byteLength, nextIndex)

        const hasMore = nextIndex < buffer.byteLength
        const chunk = new DataView(new ArrayBuffer(nextCursor - cursor))

        for (
            let offset = 1, bufferOffset = cursor;
            bufferOffset < nextCursor;
            offset++, bufferOffset++
        ) {
            chunk.setUint8(offset, buffer[bufferOffset])
        }

        chunk.setUint8(PACKET_LAST_INDEX, hasMore ? PACKET_LAST_FALSE : PACKET_LAST_TRUE)

        chunks.push(chunk)
    }

    return chunks
}

export const parseBufferChunkV2 = async(chunk: DataView): Promise<{
    buffer: number[]
    isLast: boolean
}> => {
    const buffer: number[] = []
    const isLast = chunk.getUint8(PACKET_LAST_INDEX) == PACKET_LAST_TRUE

    for (let offset = 0; offset < Math.min(MAX_PACKET_SIZE, chunk.byteLength); offset++) {
        if (offset === PACKET_LAST_INDEX) {
            continue
        }

        buffer.push(chunk.getUint8(offset))
    }

    return { buffer, isLast }
}

export const decodeChunkedResultV2 = async(chunks: number[][]): Promise<protocol.Result> => {
    const buffer = chunks.reduce((buffer, chunk) => [ ...chunk, ...buffer ], [])
    const encodedCommand = new Uint8Array(buffer)

    return await protocol.decodeResult(encodedCommand)
}

const decodeEncryptedPacketV2 = async(buffer: Uint8Array): Promise<[ protocol.EncryptedPacket, protocol.Packet ]> => {
    let encryptedPacket: protocol.EncryptedPacket

    try {
        encryptedPacket = await protocol.decodeEncryptedPacket(buffer)

        if (typeof encryptedPacket.encryptionKeyId !== 'number' && !encryptedPacket.hash) {
            throw bleErrors.invalidCommand('EncryptedPacket must contain either encryptionKeyId or hash')
        }
    } catch (err) {
        try {
            const packet = await protocol.decodePacket(buffer)

            return [ null, packet ]
        } catch (_err) {
            throw err
        }
    }

    return [ encryptedPacket, null ]
}

export const decodeChunkedPacketV2 = async(
    chunks: number[][],
    options: EncodingOptions = {},
): Promise<{
    packet: protocol.Packet
    encryptedPacket: protocol.EncryptedPacket
}> => {
    const buffer = chunks.reduce((buffer, chunk) => [ ...buffer, ...chunk ], [])
    let [ encryptedPacket, packet ] = await decodeEncryptedPacketV2(new Uint8Array(buffer))

    if (packet) {
        return { encryptedPacket, packet }
    }

    if (encryptedPacket.hash) {
        const hashedSecret = await hashSHA256([
            ...(typeof options.boxId === 'string' ?
                Buffer.from(options.boxId, 'utf-8') :
                options.boxId),
            ...parseSecretCode(options.secretCode),
        ])

        if (hashedSecret.length !== encryptedPacket.hash.length) {
            throw bleErrors.invalidSecretCode()
        }

        for (let offset = 0; offset < hashedSecret.length; offset++) {
            if (encryptedPacket.hash[offset] !== hashedSecret[offset]) {
                throw bleErrors.invalidSecretCode()
            }
        }

        packet = await protocol.decodePacket(encryptedPacket.payload)

        return { encryptedPacket, packet }
    }

    // if (encryptedPacket.encryptionKeyId !== options.keys.keyIndex) {
    //     throw bleErrors.invalidKeys('Unknown encryption key id')
    // }

    const decrypted = await decryptV2(
        encryptedPacket.payload,
        encryptedPacket.commandId,
        options.keys,
    )

    packet = await protocol.decodePacket(decrypted)

    return { encryptedPacket, packet }
}
