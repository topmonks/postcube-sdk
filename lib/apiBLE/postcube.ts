
import { jSignal, Listener } from 'jsignal'

import * as protocol from '../protocol.pb'
import { PostCubeLogger } from '../logger'
import {
    SERVICE_UUID,
    CHAR_CONTROL_UUID,
    CHAR_RESULT_UUID,
    RES_OK,
    RESPONSE_MESSAGES,
    SERVICE_BATTERY_UUID,
    CHAR_BATTERY_LEVEL_UUID,
    SERVICE_UUID_16,
    CHAR_CONTROL_UUID_16,
    CHAR_RESULT_UUID_16,
} from '../constants/bluetooth'
import { bleErrors } from '../errors'
import { parsePostCubeName } from '../helpers'
import {
    encodeCommand,
    chunkBuffer,
    parseBufferChunk,
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

export abstract class PostCube {
    static EncryptionKeys: {
        [postCubeId: string]: NonNullable<EncryptionKeys>
    } = {}

    readonly onChange: jSignal<PostCube> = new jSignal<PostCube>()
    readonly onResult: jSignal<DataView> = new jSignal<DataView>()

    readonly id: string
    readonly name: string
    readonly isDev: boolean

    abstract readonly deviceId: string
    abstract readonly isConnected: boolean

    constructor(name: string) {
        const { id, isDev } = parsePostCubeName(name)

        this.id = id
        this.name = name
        this.isDev = isDev
    }

    private async checkEncryptionKeys() {
        if (
            !PostCube.EncryptionKeys[this.id] ||
            !PostCube.EncryptionKeys[this.id].publicKey ||
            !PostCube.EncryptionKeys[this.id].privateKey ||
            typeof PostCube.EncryptionKeys[this.id].keyIndex !== 'number'
        ) {
            PostCubeLogger.error({ id: this.id }, 'Operation cannot proceed without encryption keys')
            throw bleErrors.invalidKeys(`Missing keys for PostCube (ID: ${this.id})`)
        }
    }

    setKeyIndex(keyIndex: number|null): void {
        (PostCube.EncryptionKeys[this.id] || (PostCube.EncryptionKeys[this.id] = {})).keyIndex = keyIndex
        this.onChange.dispatch(this)
        // this.emit('change', this)
    }

    setPublicKey(publicKey: Uint8Array|number[]|null): void {
        (PostCube.EncryptionKeys[this.id] || (PostCube.EncryptionKeys[this.id] = {})).publicKey = publicKey
        this.onChange.dispatch(this)
        // this.emit('change', this)
    }

    setPrivateKey(privateKey: Uint8Array|number[]|null): void {
        (PostCube.EncryptionKeys[this.id] || (PostCube.EncryptionKeys[this.id] = {})).privateKey = privateKey
        this.onChange.dispatch(this)
        // this.emit('change', this)
    }

    async readBattery(): Promise<number> {
        throw bleErrors.notSupported('Not right now... too lazy for that :D try some time later.. maybe')

        // PostCubeLogger.debug(`readBattery from PostCube (ID: ${this.id})`)

        // // const batteryValue = await this.read(SERVICE_BATTERY_UUID, CHAR_BATTERY_LEVEL_UUID)
        // const batteryValue = await this.read('battery_service', 'battery_level')
        // console.log('batteryValue:', batteryValue)

        return 0
    }

    async writeCommand(command: ArrayBufferLike): Promise<void> {
        this.connect()

        const chunks = await chunkBuffer(command)

        PostCubeLogger.log(`Sending command to PostCube (ID: ${this.id}) in ${chunks.length} packets`)

        for (const index in chunks) {
            await this.write(SERVICE_UUID_16, CHAR_CONTROL_UUID_16, chunks[index])
            PostCubeLogger.log(`Packet ${Number(index) + 1}/${chunks.length} has been sent`)
        }
    }

    async writeCommandAndReadResult(command: ArrayBufferLike): Promise<protocol.Result> {
        this.connect()

        return new Promise(async(resolve, reject) => {
            const chunks: number[][] = []

            let stopNotifications: Listener<DataView>

            const handleNotification = async(value: DataView) => {
                const { buffer, isLast } = await parseBufferChunk(value)

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
                stopNotifications = await this.listenForNotifications(SERVICE_UUID_16, CHAR_RESULT_UUID_16, handleNotification)

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
            timeSync: { timestamp },
        }, { keys: PostCube.EncryptionKeys[this.id] })

        const result = await this.writeCommandAndReadResult(command)

        if (result.value === RES_OK) {
            PostCubeLogger.debug({ timestamp }, `writeSyncTime was successfully executed on PostCube (ID: ${this.id})`)
            return
        }

        PostCubeLogger.error({ timestamp, result }, `writeSyncTime failed to execute on PostCube (ID: ${this.id})`)
        throw RESPONSE_MESSAGES[result.value]
    }

    async writeUnlock(lockId: number): Promise<void> {
        PostCubeLogger.debug({ lockId }, `writeUnlock to PostCube (ID: ${this.id})`)

        const command = await encodeCommand({
            unlock: { lockId },
        }, { keys: PostCube.EncryptionKeys[this.id] })

        const result = await this.writeCommandAndReadResult(command)

        if (result.value === RES_OK) {
            PostCubeLogger.debug({ lockId }, `writeUnlock was successfully executed on PostCube (ID: ${this.id})`)
            return
        }

        PostCubeLogger.error({ lockId, result }, `writeUnlock failed to execute on PostCube (ID: ${this.id})`)
        throw RESPONSE_MESSAGES[result.value]
    }

    async writeSetKey(
        secretCode: string,
        keyIndex: number,
        publicKey: Uint8Array|number[],
        expireAt: number,
    ): Promise<void> {
        PostCubeLogger.debug({ secretCode, keyIndex, publicKey, expireAt }, `writeSetKey to PostCube (ID: ${this.id})`)

        const _publicKey = publicKey instanceof Uint8Array ?
            publicKey :
            new Uint8Array(publicKey)

        const command = await encodeCommand({
            setKey: {
                keyIndex,
                expireAt,
                publicKey: _publicKey,
            },
        }, { secretCode })

        const result = await this.writeCommandAndReadResult(command)

        if (result.value === RES_OK) {
            PostCubeLogger.debug({ secretCode, keyIndex, publicKey, expireAt }, `writeSetKey was successfully executed on PostCube (ID: ${this.id})`)
            return
        }

        PostCubeLogger.error({ secretCode, keyIndex, publicKey, expireAt, result }, `writeSetKey failed to execute on PostCube (ID: ${this.id})`)
        throw RESPONSE_MESSAGES[result.value]
    }

    async writeFactoryReset(): Promise<void> {
        await this.checkEncryptionKeys()

        PostCubeLogger.debug(`writeFactoryReset to PostCube (ID: ${this.id})`)

        const command = await encodeCommand({
            nuke: {},
        }, { keys: PostCube.EncryptionKeys[this.id] })

        const result = await this.writeCommandAndReadResult(command)

        if (result.value === RES_OK) {
            PostCubeLogger.debug(`writeFactoryReset was successfully executed on PostCube (ID: ${this.id})`)
            return
        }

        PostCubeLogger.error({ result }, `writeFactoryReset failed to execute on PostCube (ID: ${this.id})`)
        throw RESPONSE_MESSAGES[result.value]
    }

    abstract connect(timeoutMs?: number): Promise<void>
    abstract disconnect(timeoutMs?: number): Promise<void>

    abstract read(
        serviceUUID: string|number,
        characteristicUUID: string|number,
        timeoutMs?: number,
    ): Promise<DataView>
    abstract write(
        serviceUUID: string|number,
        characteristicUUID: string|number,
        value: DataView,
        timeoutMs?: number,
    ): Promise<void>

    abstract listenForNotifications(
        serviceUUID: string|number,
        characteristicUUID: string|number,
        listener: Listener<DataView>,
        timeoutMs?: number,
    ): Promise<StopNotifications>
}
