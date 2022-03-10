
import * as protocol from '../protocol.pb'
import { bleErrors } from '../errors'
import {
    PACKET_SIZE,
    NONCE,
    PACKET_LAST_INDEX,
    PACKET_LAST_TRUE,
    PACKET_LAST_FALSE,
} from '../constants/bluetooth'
import {
    getFutureEpoch,
    parseSecretCode,
} from '../helpers'
import { hashSHA256 } from './hash'
import { EncryptionKeys, encrypt, decrypt } from './encryption'
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

const resolveEncryptionStrategy = (options: EncodingOptions): EncodingEncryptionStrategy => {
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

const resolveCommandType = (command: Command): CommandType => {
    switch (true) {
    case typeof command[CommandType.setKey]   === 'object': return CommandType.setKey
    case typeof command[CommandType.unlock]   === 'object': return CommandType.unlock
    case typeof command[CommandType.timeSync] === 'object': return CommandType.timeSync
    case typeof command[CommandType.nuke]     === 'object': return CommandType.nuke
    case typeof command[CommandType.protect]  === 'object': return CommandType.protect
    }

    return null
}

const validateCommand = (command: Command, existingCommand: CommandType) => {
    if (!existingCommand) {
        throw bleErrors.invalidCommand('Empty command')
    }

    const commandDuplicate = Object.assign({}, command)
    delete commandDuplicate[existingCommand]

    if (!!resolveCommandType(commandDuplicate)) {
        throw bleErrors.invalidCommand('Command must specify exactly 1 action (setKey/unlock/timeSync/nuke/protect)')
    }
}

export const encodeCommand = async(command: Command, options: EncodingOptions = {}): Promise<Uint8Array> => {
    const commandId = options?.commandId || await generateCommandId()
    const expireAt = options?.expireAt || await getFutureEpoch(24)

    const commandType = await resolveCommandType(command)

    await validateCommand(command, commandType)

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

    const encryptionStrategy: EncodingEncryptionStrategy = await resolveEncryptionStrategy(options)

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
            const { encrypted, authTag } = await encrypt(encodedPacket, commandId, options.keys)

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

export const encodeResult = async(commandId: number, value?: number, errorCode?: number): Promise<Uint8Array> => {
    const encodedResult = await protocol.encodeResult({ commandId, value, errorCode })
    return encodedResult
}

export const chunkBuffer = async(buffer: ArrayBufferLike): Promise<DataView[]> => {
    const chunks: DataView[] = []

    for (let index = 0; index < buffer.byteLength; index += PACKET_SIZE - 1) {
        const dataView = new DataView(new ArrayBuffer(PACKET_SIZE))

        for (
            let offset = 1, bufferOffset = index;
            bufferOffset < Math.min(buffer.byteLength, index + PACKET_SIZE - 1);
            offset++, bufferOffset++
        ) {
            dataView.setUint8(offset, buffer[bufferOffset])
        }

        const isLast = index + PACKET_SIZE - 1 < buffer.byteLength
        dataView.setUint8(PACKET_LAST_INDEX, isLast ? PACKET_LAST_FALSE : PACKET_LAST_TRUE)

        chunks.push(dataView)
    }

    return chunks
}

export const parseBufferChunk = async(chunk: DataView): Promise<{
    buffer: number[]
    isLast: boolean
}> => {
    const buffer: number[] = []

    let isLast: boolean = null
    switch (chunk.getUint8(PACKET_LAST_INDEX)) {
    case PACKET_LAST_TRUE:  isLast = true;  break
    case PACKET_LAST_FALSE: isLast = false; break
    }

    for (let offset = 0; offset < PACKET_SIZE; offset++) {
        if (offset === PACKET_LAST_INDEX) {
            continue
        }

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

export const decodeChunkedPacket = async(
    chunks: number[][],
    options: EncodingOptions = {},
): Promise<{
    packet: protocol.Packet
    encryptedPacket: protocol.EncryptedPacket
}> => {
    const buffer = chunks.reduce((buffer, chunk) => [ ...buffer, ...chunk ], [])
    let [ encryptedPacket, packet ] = await decodeEncryptedPacket(new Uint8Array(buffer))

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

    const { decrypted } = await decrypt(
        encryptedPacket.payload,
        encryptedPacket.commandId,
        options.keys,
    )

    packet = await protocol.decodePacket(decrypted)

    return { encryptedPacket, packet }
}
