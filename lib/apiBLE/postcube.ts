
import { jSignal, Listener } from 'jsignal'

import * as protocol from '../protocol.pb'
import { PostCubeLogger } from '../logger'
import {
    PostCubeVersion,
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
    MAX_PACKET_SIZE,
    DEPRECATED_SERVICE_UUID,
    DEPRECATED_CHAR_SET_KEY_UUID,
    DEPRECATED_CHAR_SAVE_ACC_UUID,
    DEPRECATED_SERVICE_UUID_16,
    DEPRECATED_CHAR_RESULT_UUID,
    DEPRECATED_CHAR_UNLOCK_UUID,
    DEPRECATED_CHAR_TIME_SYNC_UUID,
    DEFAULT_TIMEOUT_I_AND_O,
    DEFAULT_TIMEOUT_LISTEN,
} from '../constants/bluetooth'
import { LOW_BATTERY_THRESHOLD_CENT } from '../constants/box'
import { bleErrors } from '../errors'
import {
    generateTimestamp,
    parsePostCubeName,
    parseSecretCode,
    sanitizePublicKey,
    uint32ToByteArray,
    withTimeoutRace,
} from '../helpers'
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

export type Unwatch = () => void

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

export interface BatchOptions {
    shouldDisconnect(success: boolean, err?: any): boolean|Promise<boolean>
}

export abstract class PostCube {
    static keys: Keys = localStorageKeys

    readonly onChange: jSignal<PostCube> = new jSignal<PostCube>()
    readonly onResult: jSignal<DataView> = new jSignal<DataView>()

    readonly id: string
    readonly name: string
    readonly isDev: boolean

    virtual: boolean
    inactivityDisconnectTimeoutMs: number

    abstract readonly version: PostCubeVersion
    abstract readonly deviceId: string
    abstract readonly isConnected: boolean

    private inactivityDisconnectTimeout // number|NodeJS.Timeout

    private _activeOperations = 0
    protected get activeOperations(): number { return this._activeOperations }
    protected set activeOperations(activeOperations: number) {
        const renewInactivityDisconnectTimeout =
            this.inactivityDisconnectTimeoutMs && activeOperations > this._activeOperations

        clearTimeout(this.inactivityDisconnectTimeout)
        this.inactivityDisconnectTimeout = null

        this._activeOperations = activeOperations

        if (renewInactivityDisconnectTimeout) {
            this.inactivityDisconnectTimeout = setTimeout(() => {
                PostCubeLogger.info({
                    inactivityDisconnectTimeoutMs: this.inactivityDisconnectTimeoutMs,
                    postCube: this,
                }, this?.tmpl(`Automatically disconnecting from PostCube %id% due to inactivity %platform%`))

                this.disconnect()
            }, this.inactivityDisconnectTimeoutMs)
        }
    }

    constructor(name: string) {
        const { id, isDev } = parsePostCubeName(name)

        this.id = id
        this.name = name
        this.isDev = isDev
    }

    public async startResultNotificationsV1(timeoutMs: number = DEFAULT_TIMEOUT_LISTEN) {
        await this.startNotifications(
            DEPRECATED_SERVICE_UUID,
            DEPRECATED_CHAR_RESULT_UUID,
            timeoutMs,
        )
    }

    async batchCommands<Result>(procedure: () => Result, options?: BatchOptions): Promise<Result> {
        let success = true, err

        try {
            if (++this.activeOperations < 2) {
                await this.connect()
            }

            return await procedure()
        } catch (_err) {
            success = false
            err = _err

            PostCubeLogger.error({
                activeTransactions: this.activeOperations,
                postCube: this,
            }, this?.tmpl(`Failed to execute batch of commands on %id_platform%`))

            throw err
        } finally {
            --this.activeOperations

            if (
                typeof options?.shouldDisconnect === 'function'
                && await options.shouldDisconnect(success, err)
            ) {
                await this.disconnect()
            }
        }
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

    private async readBatteryV1(): Promise<number> {
        PostCubeLogger.debug({ postCube: this }, this?.tmpl(`readBatteryV1 on %id_platform%`))

        const value = await this.read('battery_service', 'battery_level')

        // Ugly
        const batteryPercent = value instanceof DataView ?
            value.getUint8(0) :
            value[0]

        PostCubeLogger.info({ batteryPercent, value }, this?.tmpl(`Read battery result from %id_platform%`))

        return batteryPercent
    }

    private async readBatteryV2(): Promise<number> {
        PostCubeLogger.warn(
            { postCube: this },
            this?.tmpl(`readBatteryV2 is not implemented; Mocking value from PostCube %id% for now %platform%`),
        )

        return LOW_BATTERY_THRESHOLD_CENT + 1

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
        // try {
        //     ++this.activeOperations
        if (!characteristicUUID) {
            throw bleErrors.unknownBLECharacteristic('writeCommandV1 has to have a characteristic specified');
        }

        const chunks = await splitCommandV1(new Uint8Array(command), MAX_PACKET_SIZE)

        PostCubeLogger.log(this?.tmpl(`Sending command to PostCube %id% in ${chunks.length} packets %platform%`))

        for (const index in chunks) {
            const packetDataView = new DataView(chunks[index].buffer)

            try {
                await this.write(DEPRECATED_SERVICE_UUID, characteristicUUID, packetDataView)

                PostCubeLogger.log({
                    characteristicUUID,
                    packetDataView,
                    packetUint8Array: chunks[index],
                }, this?.tmpl(`Packet ${Number(index) + 1}/${chunks.length} has been sent to %id_platform%`))
            } catch (err) {
                PostCubeLogger.error({
                    err,
                    characteristicUUID,
                    packetDataView,
                    packetUint8Array: chunks[index],
                }, this?.tmpl(`Packet ${Number(index) + 1}/${chunks.length} failed to be written to %id_platform%`))

                throw err
            }
        }
        // } finally {
        //     --this.activeOperations
        // }
    }

    private async writeCommandV2(command: ArrayBufferLike): Promise<void> {
        const chunks = await chunkBufferV2(command)

        PostCubeLogger.log(`Sending command to PostCube %id% in ${chunks.length} packets`)

        for (const index in chunks) {
            await this.write(SERVICE_UUID, CHAR_CONTROL_UUID, chunks[index])
            PostCubeLogger.log(`Packet ${Number(index) + 1}/${chunks.length} has been sent to %id_platform%`)
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

    public async writeCommandAndReadResultV1(command: ArrayBufferLike, characteristicUUID: string|number): Promise<number> {
        const result = await this.batchCommands(() => {
            let unwatch: Unwatch

            return withTimeoutRace(
                () => new Promise<number>(async(resolve, reject) => {
                    const handleNotification = async(value) => {
                        PostCubeLogger.log({
                            value,
                            version: this.version,
                        }, this?.tmpl(`Receiving result from %id_platform%`))

                        const parsedResult = await parseResultV1(value, characteristicUUID)

                        PostCubeLogger.log({
                            parsedResult,
                            version: this.version,
                        }, this?.tmpl(`Result received from %id_platform%`))

                        if (typeof unwatch === 'function') {
                            await unwatch()
                        }

                        resolve(parsedResult)
                    }

                    try {
                        unwatch = await this.watchNotifications(DEPRECATED_SERVICE_UUID, DEPRECATED_CHAR_RESULT_UUID, handleNotification)

                        await this.writeCommand(command, characteristicUUID)
                    } catch (err) {
                        reject(err)
                    }
                }),
                DEFAULT_TIMEOUT_I_AND_O,
                bleErrors.timeout('writeCommandAndReadResultV1 timed out'),
                false,
            )
        })

        return result
    }

    public async writeCommandAndReadResultV2(command: ArrayBufferLike): Promise<protocol.Result> {
        // this.connect()

        return new Promise(async(resolve, reject) => {
            const chunks = []
            let stopNotifications
            const handleNotification = async(value) => {
                const { buffer, isLast } = await parseBufferChunkV2(value)

                PostCubeLogger.log({
                    buffer, isLast,
                    version: this.version,
                }, this?.tmpl(`Receiving result packet from %id_platform%`))

                chunks.push(buffer)

                if (isLast) {
                    stopNotifications()

                    decodeChunkedResultV2(chunks).then(result => {
                        PostCubeLogger.log({
                            result,
                            version: this.version,
                        }, this?.tmpl(`Result received from PostCube %id% has been decoded %platform%`))
                        resolve(result)
                    }).catch(reject)
                }
            }

            try {
                stopNotifications = await this.watchNotifications(SERVICE_UUID_16, CHAR_RESULT_UUID_16, handleNotification)
                await this.writeCommand(command)
            } catch (err) {
                reject(err)
            }
        })
    }

    public async writeSyncTime(timestamp: number): Promise<undefined|number> {
        PostCubeLogger.debug({
            timestamp,
            version: this.version,
        }, this?.tmpl(`writeSyncTime to %id_platform%`))

        const { privateKey, publicKey } = await PostCube.keys.getDeviceKeyPair()

        const keyIndex = await PostCube.keys.getDeviceKeyIndex(this.id)
        const hashedSecretCode = await PostCube.keys.getDeviceHashedSecretCode(this.id)

        switch (this.version) {
            case PostCubeVersion.v1:
                const encrypted = await createCommandV1(privateKey, publicKey, Math.floor(Date.now() / 1000), [])

                if (isNaN(keyIndex)) {
                    PostCubeLogger.warn({ timestamp, keyIndex }, this?.tmpl(`Cannot writeSyncTime to PostCube %id% without keyIndex %platform%`))
                    return
                }

                return this.writeCommandAndReadResultV1(
                    new Uint8Array([ keyIndex, ...encrypted ]),
                    DEPRECATED_CHAR_TIME_SYNC_UUID,
                )
            case PostCubeVersion.v2:
                await this.checkEncryptionKeys()

                const command = await encodeCommandV2({
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
                    PostCubeLogger.debug({ timestamp }, this?.tmpl(`writeSyncTime was successfully executed on %id_platform%`))
                    return
                }

                PostCubeLogger.error({ timestamp, result }, this?.tmpl(`writeSyncTime failed to execute on %id_platform%`))
                throw RESPONSE_MESSAGES[result.value]
        }

        throw bleErrors.notSupported('Invalid PostCube Version')
    }

    public async writeUnlock(lockId: number = 0): Promise<undefined|number> {
        PostCubeLogger.debug({
            lockId,
            version: this.version,
        }, this?.tmpl(`writeUnlock to %id_platform%`))

        const { privateKey, publicKey } = await PostCube.keys.getDeviceKeyPair()
        const keyIndex = await PostCube.keys.getDeviceKeyIndex(this.id)
        const hashedSecretCode = await PostCube.keys.getDeviceHashedSecretCode(this.id)

        switch (this.version) {
            case PostCubeVersion.v1:
                if (lockId > 0) {
                    PostCubeLogger.warn({ lockId }, this?.tmpl(`Attempting to create unlock command for multibox partition on PostCube V1 %id%; lockId will be ignored`))
                }

                const encrypted = await createCommandV1(privateKey, publicKey, Math.floor((Date.now() + 60000) / 1000), [])

                return this.writeCommandAndReadResultV1(
                    new Uint8Array([ keyIndex, ...encrypted ]),
                    DEPRECATED_CHAR_UNLOCK_UUID,
                )
            case PostCubeVersion.v2:
                const command = await encodeCommandV2({
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
                    }, this?.tmpl(`writeUnlock was successfully executed on %id_platform%`))

                    return resultV2.value
                }

                PostCubeLogger.error({
                    lockId,
                    result: resultV2,
                }, this?.tmpl(`writeUnlock failed to execute on %id_platform%`))

                throw RESPONSE_MESSAGES[resultV2.value]
        }

        throw bleErrors.notSupported('Invalid PostCube Version')
    }

    public async writeDeviceKey(
        secretCode: string,
        keyIndex: number,
        publicKey: Uint8Array|number[],
        expireAt: number,
    ): Promise<undefined|number> {
        PostCubeLogger.debug({
            secretCode, keyIndex, publicKey, expireAt,
            version: this.version,
        }, this?.tmpl(`writeDeviceKey to %id_platform%`))

        switch (this.version) {
            case PostCubeVersion.v1:
                const sanitizedPublicKey = await sanitizePublicKey(
                    publicKey instanceof Uint8Array ?
                        publicKey :
                        new Uint8Array(publicKey),
                )

                const timestamp = generateTimestamp(false);
                const hash = await hashSHA256([
                    ...sanitizedPublicKey,
                    ...timestamp,
                    ...parseSecretCode(secretCode),
                ])

                return this.writeCommandAndReadResultV1(new Uint8Array([
                    ...sanitizedPublicKey,
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
                    }, this?.tmpl(`writeSetKey was successfully executed on %id_platform%`))

                    return resultV2.value
                }

                PostCubeLogger.error({
                    secretCode, keyIndex, publicKey, expireAt,
                    result: resultV2,
                }, this?.tmpl(`writeSetKey failed to execute on %id_platform%`))

                throw RESPONSE_MESSAGES[resultV2.value]
        }

    }

    public async writeAccountKey(publicKey: Uint8Array|number[], secretCode: string): Promise<undefined|number> {
        PostCubeLogger.debug({
            publicKey, secretCode,
            version: this.version,
        }, this?.tmpl(`writeAccountKey to %id_platform%`))

        switch (this.version) {
            case PostCubeVersion.v1:
                const sanitizedPublicKey = await sanitizePublicKey(
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

    public async writeFactoryReset(): Promise<undefined|number> {
        PostCubeLogger.debug({
            version: this.version,
        }, this?.tmpl(`writeFactoryReset to %id_platform%`))

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
                    }, this?.tmpl(`writeFactoryReset was successfully executed on %id_platform%`))

                    return resultV2.value
                }

                PostCubeLogger.error({
                    result: resultV2,
                }, this?.tmpl(`writeFactoryReset failed to execute on %id_platform%`))

                throw RESPONSE_MESSAGES[resultV2.value]
        }

        throw bleErrors.notSupported('Invalid PostCube Version')
    }

    // Template string (see lib/helpers.ts)
    protected abstract tmpl(string: string): string

    abstract connect(timeoutMs?: number): Promise<void>
    abstract disconnect(timeoutMs?: number): Promise<void>

    abstract read(
        serviceUUID: string|number,
        characteristicUUID: string|number,
        timeoutMs?: number,
    ): Promise<DataView|ArrayBuffer>

    abstract write(
        serviceUUID: string|number,
        characteristicUUID: string|number,
        value: DataView,
        timeoutMs?: number,
    ): Promise<void>

    abstract startNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs?: number,
    ): Promise<void>

    abstract watchNotifications(
        serviceUUID: string|number,
        characteristicUUID: string|number,
        listener: Listener<DataView|ArrayBuffer>,
        timeoutMs?: number,
    ): Promise<Unwatch>
}
