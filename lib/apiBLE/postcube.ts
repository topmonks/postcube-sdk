
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
    PostCubeVersion,
    PACKET_SIZE,
    DEPRECATED_SERVICE_UUID,
    DEPRECATED_CHAR_SET_KEY_UUID,
    DEPRECATED_CHAR_SAVE_ACC_UUID,
    DEPRECATED_SERVICE_UUID_16,
    DEPRECATED_CHAR_RESULT_UUID,
    DEPRECATED_CHAR_UNLOCK_UUID,
    DEPRECATED_CHAR_TIME_SYNC_UUID,
} from '../constants/bluetooth'
import { bleErrors } from '../errors'
import { generateTimestamp, parsePostCubeName, parseSecretCode, sanitizePublicKey, uint32ToByteArray } from '../helpers'
import {
    splitCommandV1,
    parseResultV1,
    createCommandV1,
    encodeCommandV2,
    chunkBufferV2,
    parseBufferChunkV2,
    decodeChunkedResultV2,
    EncryptionKeys,
} from '../encoding'
import { hashSHA256 } from '../encoding/hash'
import { Keys, localStorageKeys } from './keys'

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
    static keys: Keys = localStorageKeys

    // static EncryptionKeys: {
    //     [postCubeId: string]: NonNullable<EncryptionKeys>
    // } = {}

    readonly onChange: jSignal<PostCube> = new jSignal<PostCube>()
    readonly onResult: jSignal<DataView> = new jSignal<DataView>()

    readonly id: string
    readonly name: string
    readonly isDev: boolean

    virtual: boolean

    abstract readonly version: PostCubeVersion
    abstract readonly deviceId: string
    abstract readonly isConnected: boolean

    constructor(name: string) {
        const { id, isDev } = parsePostCubeName(name)

        this.id = id
        this.name = name
        this.isDev = isDev
    }

    private async checkEncryptionKeys() {
        const keyPair = await PostCube.keys.getDeviceKeyPair()
        const keyIndex = await PostCube.keys.getDeviceKeyIndex(this.id)

        if (
            !keyPair ||
            !keyPair.publicKey ||
            !keyPair.privateKey ||
            typeof keyIndex !== 'number'
        ) {
            PostCubeLogger.error({ id: this.id }, 'Operation cannot proceed without encryption keys')
            throw bleErrors.invalidKeys(`Missing keys for PostCube (ID: ${this.id})`)
        }
    }

    // setKeyIndex(keyIndex: number|null): void {
    //     (PostCube.EncryptionKeys[this.id] || (PostCube.EncryptionKeys[this.id] = {})).keyIndex = keyIndex
    //     this.onChange.dispatch(this)
    // }

    // setPublicKey(publicKey: Uint8Array|number[]|null): void {
    //     (PostCube.EncryptionKeys[this.id] || (PostCube.EncryptionKeys[this.id] = {})).publicKey = publicKey
    //     this.onChange.dispatch(this)
    // }

    // setPrivateKey(privateKey: Uint8Array|number[]|null): void {
    //     (PostCube.EncryptionKeys[this.id] || (PostCube.EncryptionKeys[this.id] = {})).privateKey = privateKey
    //     this.onChange.dispatch(this)
    // }

    private async readBatteryV1(): Promise<number> {
        throw bleErrors.notSupported('Not right now... too lazy for that :D try some time later.. maybe')

        // PostCubeLogger.debug(`readBattery from PostCube (ID: ${this.id})`)

        // // const batteryValue = await this.read(SERVICE_BATTERY_UUID, CHAR_BATTERY_LEVEL_UUID)
        // const batteryValue = await this.read('battery_service', 'battery_level')
        // console.log('batteryValue:', batteryValue)

        return 0
    }

    private async readBatteryV2(): Promise<number> {
        throw bleErrors.notSupported('Not right now... too lazy for that :D try some time later.. maybe')

        // PostCubeLogger.debug(`readBattery from PostCube (ID: ${this.id})`)

        // // const batteryValue = await this.read(SERVICE_BATTERY_UUID, CHAR_BATTERY_LEVEL_UUID)
        // const batteryValue = await this.read('battery_service', 'battery_level')
        // console.log('batteryValue:', batteryValue)

        return 0
    }

    public async readBattery(): Promise<number> {
        switch (this.version) {
        case PostCubeVersion.v1:
            return this.readBatteryV1()
        case PostCubeVersion.v2:
            return this.readBatteryV2()
        }

        throw bleErrors.notSupported('Invalid PostCube version')
    }

    private async writeCommandV1(command: ArrayBufferLike, characteristicUUID: string|number): Promise<void> {
        if (!characteristicUUID) {
            throw bleErrors.unknownBLECharacteristic('writeCommandV1 has to have specified characteristic')
        }

        const chunks = await splitCommandV1(new Uint8Array(command), PACKET_SIZE)

        PostCubeLogger.log(`Sending command to PostCube (ID: ${this.id}) in ${chunks.length} packets`)

        for (const index in chunks) {
            await this.write(DEPRECATED_SERVICE_UUID, characteristicUUID, new DataView(chunks[index]))
            PostCubeLogger.log(`Packet ${Number(index) + 1}/${chunks.length} has been sent`)
        }
    }

    private async writeCommandV2(command: ArrayBufferLike): Promise<void> {
        const chunks = await chunkBufferV2(command)

        PostCubeLogger.log(`Sending command to PostCube (ID: ${this.id}) in ${chunks.length} packets`)

        for (const index in chunks) {
            await this.write(SERVICE_UUID, CHAR_CONTROL_UUID, chunks[index])
            PostCubeLogger.log(`Packet ${Number(index) + 1}/${chunks.length} has been sent`)
        }
    }

    public async writeCommand(command: ArrayBufferLike, characteristicUUID?: string|number): Promise<void> {
        this.connect()

        switch (this.version) {
        case PostCubeVersion.v1:
            return this.writeCommandV1(command, characteristicUUID)
        case PostCubeVersion.v2:
            if (!!characteristicUUID) {
                PostCubeLogger.warn({
                    command, characteristicUUID,
                }, `characteristicUUID is ignored; PostCube V2 is using a universal characteristic for all commands`)
            }

            return this.writeCommandV2(command)
        }

        throw bleErrors.notSupported('Invalid PostCube version')
    }

    async writeCommandAndReadResultV1(command: ArrayBufferLike, characteristicUUID: string|number): Promise<number> {
        this.connect()

        return new Promise<number>(async(resolve, reject) => {
            let stopNotifications: Listener<DataView>

            const handleNotification = async(value: DataView) => {
                PostCubeLogger.log({
                    value,
                    version: this.version,
                }, `Receiving result from PostCube (ID: ${this.id})`)

                const parsedResult = await parseResultV1(value, characteristicUUID)

                PostCubeLogger.log({
                    parsedResult,
                    version: this.version,
                }, `Result received from PostCube (ID: ${this.id})`)

                stopNotifications()
                resolve(parsedResult)
            }

            try {
                stopNotifications = await this.listenForNotifications(
                    DEPRECATED_SERVICE_UUID_16,
                    DEPRECATED_CHAR_RESULT_UUID,
                    handleNotification,
                )

                await this.writeCommand(command, characteristicUUID)
            } catch (err) {
                reject(err)
            }
        })
    }

    async writeCommandAndReadResultV2(command: ArrayBufferLike): Promise<protocol.Result> {
        this.connect()

        return new Promise<protocol.Result>(async(resolve, reject) => {
            const chunks: number[][] = []

            let stopNotifications: Listener<DataView>

            const handleNotification = async(value: DataView) => {
                const { buffer, isLast } = await parseBufferChunkV2(value)

                PostCubeLogger.log({
                    buffer, isLast,
                    version: this.version,
                }, `Receiving result packet from PostCube (ID: ${this.id})`)

                chunks.push(buffer)

                if (isLast) {
                    stopNotifications()

                    decodeChunkedResultV2(chunks).then(result => {
                        PostCubeLogger.log({
                            result,
                            version: this.version,
                        }, `Result received from PostCube (ID: ${this.id}) has been decoded`)

                        resolve(result)
                    }).catch(reject)
                }
            }

            try {
                stopNotifications = await this.listenForNotifications(
                    SERVICE_UUID_16,
                    CHAR_RESULT_UUID_16,
                    handleNotification,
                )

                await this.writeCommand(command)
            } catch (err) {
                reject(err)
            }
        })
    }

    async writeSyncTime(timestamp: number): Promise<undefined|number> {
        PostCubeLogger.debug({
            timestamp,
            version: this.version,
        }, `writeSyncTime to PostCube (ID: ${this.id})`)

        const { privateKey, publicKey } = await PostCube.keys.getDeviceKeyPair()
        const keyIndex = await PostCube.keys.getDeviceKeyIndex(this.id)
        const hashedSecretCode = await PostCube.keys.getDeviceHashedSecretCode(this.id)

        let command
        switch (this.version) {
        case PostCubeVersion.v1:
            const encrypted = await createCommandV1(privateKey, publicKey, Math.floor(Date.now() / 1000), [])

            if (isNaN(keyIndex)) {
                PostCubeLogger.warn({ timestamp, keyIndex }, `Cannot writeSyncTime to PostCube (ID: ${this.id}) without keyIndex`)
                return
            }

            command = new Uint8Array([ keyIndex, ...encrypted ])

            return this.writeCommandAndReadResultV1(command, DEPRECATED_CHAR_TIME_SYNC_UUID)
        case PostCubeVersion.v2:
            await this.checkEncryptionKeys()

            command = await encodeCommandV2({
                timeSync: { timestamp },
            }, {
                keys: {
                    privateKey,
                    publicKey,
                    keyIndex,
                    hashedSecretCode,
                },
            })

            const result = await this.writeCommandAndReadResultV2(command)

            if (result.value === RES_OK) {
                PostCubeLogger.debug({ timestamp }, `writeSyncTime was successfully executed on PostCube (ID: ${this.id})`)
                return
            }

            PostCubeLogger.error({ timestamp, result }, `writeSyncTime failed to execute on PostCube (ID: ${this.id})`)
            throw RESPONSE_MESSAGES[result.value]
        }

        throw bleErrors.notSupported('Invalid PostCube Version')
    }

    async writeUnlock(lockId: number = 0): Promise<undefined|number> {
        PostCubeLogger.debug({
            lockId,
            version: this.version,
        }, `writeUnlock to PostCube (ID: ${this.id})`)

        const { privateKey, publicKey } = await PostCube.keys.getDeviceKeyPair()
        const keyIndex = await PostCube.keys.getDeviceKeyIndex(this.id)
        const hashedSecretCode = await PostCube.keys.getDeviceHashedSecretCode(this.id)

        let command: Uint8Array
        switch (this.version) {
        case PostCubeVersion.v1:
            if (lockId > 0) {
                PostCubeLogger.warn({
                    lockId,
                }, `Attempting to create unlock command for multibox partition on PostCube V1 (ID: ${this.id}); lockId will be ignored`)
            }

            const encrypted = await createCommandV1(privateKey, publicKey, Math.floor((Date.now() + 60000) / 1000), [])

            command = new Uint8Array([ keyIndex, ...encrypted ])

            return this.writeCommandAndReadResultV1(command, DEPRECATED_CHAR_UNLOCK_UUID)
        case PostCubeVersion.v2:
            command = await encodeCommandV2({
                unlock: { lockId },
            }, {
                keys: {
                    privateKey,
                    publicKey,
                    keyIndex,
                    hashedSecretCode,
                },
            })

            const resultV2 = await this.writeCommandAndReadResultV2(command)

            if (resultV2.value === RES_OK) {
                PostCubeLogger.debug({
                    lockId,
                    result: resultV2,
                }, `writeUnlock was successfully executed on PostCube (ID: ${this.id})`)
                return resultV2.value
            }

            PostCubeLogger.error({
                lockId,
                result: resultV2,
            }, `writeUnlock failed to execute on PostCube (ID: ${this.id})`)
            throw RESPONSE_MESSAGES[resultV2.value]
        }
    }

    async writeDeviceKey(
        secretCode: string,
        keyIndex: number,
        publicKey: Uint8Array|number[],
        expireAt: number,
    ): Promise<undefined|number> {
        PostCubeLogger.debug({
            secretCode, keyIndex, publicKey, expireAt,
            version: this.version,
        }, `writeDeviceKey to PostCube (ID: ${this.id})`)

        switch (this.version) {
        case PostCubeVersion.v1:
            const sanitizedPublicKey = sanitizePublicKey(
                publicKey instanceof Uint8Array ?
                    publicKey :
                    new Uint8Array(publicKey),
            )

            const timestamp = generateTimestamp(false)
            const hash = await hashSHA256([
                ...sanitizedPublicKey,
                ...timestamp,
                ...parseSecretCode(secretCode),
            ])

            return this.writeCommandAndReadResultV1(new Uint8Array([
                ...publicKey,
                ...timestamp,
                ...hash,
            ]), DEPRECATED_CHAR_SET_KEY_UUID)
        case PostCubeVersion.v2:
            const _publicKey = publicKey instanceof Uint8Array ?
                publicKey :
                new Uint8Array(publicKey)

            const command = await encodeCommandV2({
                setKey: {
                    keyIndex,
                    expireAt,
                    publicKey: _publicKey,
                },
            }, { secretCode })

            const resultV2 = await this.writeCommandAndReadResultV2(command)

            if (resultV2.value === RES_OK) {
                PostCubeLogger.debug({
                    secretCode, keyIndex, publicKey, expireAt,
                    result: resultV2,
                }, `writeSetKey was successfully executed on PostCube (ID: ${this.id})`)
                return resultV2.value
            }

            PostCubeLogger.error({
                secretCode, keyIndex, publicKey, expireAt,
                result: resultV2,
            }, `writeSetKey failed to execute on PostCube (ID: ${this.id})`)
            throw RESPONSE_MESSAGES[resultV2.value]
        }

        throw bleErrors.notSupported('Invalid PostCube Version')
    }

    async writeAccountKey(publicKey: Uint8Array|number[], secretCode: string): Promise<undefined|number> {
        PostCubeLogger.debug({
            publicKey, secretCode,
            version: this.version,
        }, `writeAccountKey to PostCube (ID: ${this.id})`)

        switch (this.version) {
        case PostCubeVersion.v1:
            const sanitizedPublicKey = sanitizePublicKey(
                publicKey instanceof Uint8Array ?
                    publicKey :
                    new Uint8Array(publicKey),
            )

            const timestamp = generateTimestamp(false)
            const hash = await hashSHA256([
                ...sanitizedPublicKey,
                ...timestamp,
                ...parseSecretCode(secretCode),
            ])

            return this.writeCommandAndReadResultV1(new Uint8Array([
                ...sanitizedPublicKey,
                ...timestamp,
                ...hash,
            ]), DEPRECATED_CHAR_SAVE_ACC_UUID)
        case PostCubeVersion.v2:
            throw bleErrors.notSupported('Set account key is not supported in PostCube V2')
        }

        throw bleErrors.notSupported('Invalid PostCube Version')
    }

    async writeFactoryReset(): Promise<undefined|number> {
        PostCubeLogger.debug({
            version: this.version,
        }, `writeFactoryReset to PostCube (ID: ${this.id})`)

        switch (this.version) {
        case PostCubeVersion.v1:
            throw bleErrors.notSupported('Factory reset is not supported in PostCube V1')
        case PostCubeVersion.v2:
            await this.checkEncryptionKeys()

            const { privateKey, publicKey } = await PostCube.keys.getDeviceKeyPair()
            const keyIndex = await PostCube.keys.getDeviceKeyIndex(this.id)
            const hashedSecretCode = await PostCube.keys.getDeviceHashedSecretCode(this.id)

            const command = await encodeCommandV2({
                nuke: {},
            }, {
                keys: {
                    privateKey,
                    publicKey,
                    keyIndex,
                    hashedSecretCode,
                },
            })

            const resultV2 = await this.writeCommandAndReadResultV2(command)

            if (resultV2.value === RES_OK) {
                PostCubeLogger.debug({
                    result: resultV2,
                }, `writeFactoryReset was successfully executed on PostCube (ID: ${this.id})`)
                return resultV2.value
            }

            PostCubeLogger.error({
                result: resultV2,
            }, `writeFactoryReset failed to execute on PostCube (ID: ${this.id})`)
            throw RESPONSE_MESSAGES[resultV2.value]
        }

        throw bleErrors.notSupported('Invalid PostCube Version')
    }

    abstract connect(timeoutMs?: number): Promise<void>
    abstract disconnect(timeoutMs?: number): Promise<void>

    abstract readV2(
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
