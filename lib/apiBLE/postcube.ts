
import { EventEmitter } from 'events'
import { Listener } from 'jsignal'

import * as protocol from '../protocol.pb'
import { PostCubeLogger } from '../logger'
import {
    SERVICE_UUID,
    CHAR_CONTROL_UUID,
    CHAR_RESULT_UUID,
} from '../constants/bluetooth'
import { bleErrors } from '../errors'
import { parseBoxName } from '../helpers'
import {
    encodeCommand,
    parseResultChunk,
    chunkCommand,
    decodeChunkedResult,
    EncryptionKeys,
} from '../encoding'

export type StopNotifications = () => void

export type EventChangeListener = (postCube: PostCube) => any
export type EventResultListener = (value: DataView) => any

export interface ScanOptions {
    namePrefix?: string
    timeout?: number
    onDiscovery?(postCube: PostCube): any
}

export interface ScanResult {
    promise: Promise<void>
    stopScan(): void
}

export abstract class PostCube extends EventEmitter {
    readonly id: string
    readonly name: string
    readonly isMultibox: boolean

    abstract readonly deviceId: string
    abstract readonly isConnected: boolean

    private encryptionKeys: EncryptionKeys = null

    constructor(name: string) {
        super()

        const { id, isMultibox } = parseBoxName(name)

        this.id = id
        this.name = name
        this.isMultibox = isMultibox
    }

    private async checkEncryptionKeys() {
        if (!this.encryptionKeys) {
            throw bleErrors.invalidKeys(`Missing keys for PostCube (ID: ${this.id})`)
        }
    }

    setEncryptionKeys(keys: EncryptionKeys): void {
        this.encryptionKeys = keys
        this.emit('change', this)
    }

    async readBattery(): Promise<number> {
        return 0
    }

    async writeCommand(command: ArrayBufferLike): Promise<void> {
        this.connect()

        const chunks = await chunkCommand(command)

        PostCubeLogger.log(`Sending command to PostCube (ID: ${this.id}) in ${chunks.length} packets`)

        for (const index in chunks) {
            await this.write(SERVICE_UUID, CHAR_CONTROL_UUID, chunks[index])
            PostCubeLogger.log(`Packet ${index + 1}/${chunks.length} has been sent`)
        }
    }

    async writeCommandAndReadResult(command: ArrayBufferLike): Promise<protocol.Result> {
        this.connect()

        return new Promise(async(resolve, reject) => {
            const chunks: number[][] = []

            let stopNotifications: Listener<DataView>

            const handleNotification = async(value: DataView) => {
                const { buffer, isLast } = await parseResultChunk(value)

                PostCubeLogger.log({ buffer, isLast }, `Receiving result packet from PostCube (ID: ${this.id})`)

                chunks.push(buffer)

                if (isLast) {
                    stopNotifications()

                    decodeChunkedResult(chunks).then(result => {
                        PostCubeLogger.log({ result }, `Result received from PostCube (ID: ${this.id}) has been decoded`)

                        resolve(result)
                    }).catch(reject)
                }
            }

            try {
                stopNotifications = await this.listenForNotifications(SERVICE_UUID, CHAR_RESULT_UUID, handleNotification)

                await this.writeCommand(command)
            } catch (err) {
                reject(err)
            }
        })
    }

    async writeSyncTime(timestamp: number): Promise<void> {
        await this.checkEncryptionKeys()

        PostCubeLogger.debug({ timestamp }, `writeSyncTime to PostCube (ID: ${this.id})`)

        const command = await encodeCommand({
            timeSync: {
                timestamp,
            },
        }, { keys: this.encryptionKeys })

        const result = await this.writeCommandAndReadResult(command)

        // TODO: return result
    }

    async writeUnlock(lockId: number): Promise<void> {
        PostCubeLogger.debug({ lockId }, `writeUnlock to PostCube (ID: ${this.id})`)

        const command = await encodeCommand({
            unlock: { lockId },
        })

        const result = await this.writeCommandAndReadResult(command)

        // TODO: return result
    }

    async writeSetKey(
        secretCode: string,
        keyIndex: number,
        publicKey: Uint8Array,
        expireAt: number,
    ): Promise<void> {
        PostCubeLogger.debug({ secretCode, keyIndex, publicKey, expireAt }, `writeSetKey to PostCube (ID: ${this.id})`)

        const command = await encodeCommand({
            setKey: {
                keyIndex,
                expireAt,
                publicKey,
            },
        }, { secretCode })

        const result = await this.writeCommandAndReadResult(command)

        // TODO: return result
    }

    async writeFactoryReset(): Promise<void> {
        await this.checkEncryptionKeys()

        PostCubeLogger.debug(`writeFactoryReset to PostCube (ID: ${this.id})`)

        const command = await encodeCommand({
            nuke: {},
        }, { keys: this.encryptionKeys })

        const result = await this.writeCommandAndReadResult(command)

        // TODO: return result
    }

    abstract connect(timeoutMs?: number): Promise<void>
    abstract disconnect(timeoutMs?: number): Promise<void>

    abstract read(serviceUUID: string, characteristicUUID: string): Promise<DataView>
    abstract write(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void>

    abstract listenForNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<DataView>,
    ): Promise<StopNotifications>
}

export declare interface PostCube {
    addListener(event: 'change', listener: EventChangeListener)
    addListener(event: 'result', listener: EventResultListener)

    removeListener(event: 'change', listener: EventChangeListener)
    removeListener(event: 'result', listener: EventResultListener)

    on(event: 'change', listener: EventChangeListener)
    on(event: 'result', listener: EventResultListener)

    once(event: 'change', listener: EventChangeListener)
    once(event: 'result', listener: EventResultListener)

    emit(event: 'change', postCube: PostCube)
    emit(event: 'result', value: DataView)
}
