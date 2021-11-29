
import {
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
    CHAR_BATTERY_LEVEL_UUID,
    CHAR_UNLOCK_UUID,
    CHAR_SET_KEY_UUID,
    CHAR_TIME_SYNC_UUID,
    CHAR_RESULT_UUID,
} from '../constants/bluetooth'
import {
    getFutureEpoch,
    parseResultValue,
} from '../helpers'
import {
    encodeCommand,
    EncodingEncryptionKeys,
} from '../encoding'
import { Cube, CubeCommands } from './cube'
import { cubeErrors } from '../errors'

export const cubeCommands = (cube: () => Cube): CubeCommands => {
    let encryptionKeys: EncodingEncryptionKeys = null

    const setEncryptionKeys = (keys?: EncodingEncryptionKeys) => {
        if (!keys) {
            encryptionKeys = null
            return
        }

        encryptionKeys = keys
    }

    const sendCommand = async(characteristicUUID: string, value: DataView) => {
        await cube().write(SERVICE_UUID, characteristicUUID, value)
    }

    const sendCommandAndReadResult = (characteristicUUID: string, value: DataView): Promise<number> =>
        new Promise(async(resolve, reject) => {
            try {
                const stopNotifications = await cube().listenForNotifications(SERVICE_UUID, CHAR_RESULT_UUID, value => {
                    stopNotifications()

                    const result = parseResultValue(value, characteristicUUID)
                    return resolve(result)
                })

                await sendCommand(characteristicUUID, value)
            } catch (err) {
                reject(err)
            }
        })

    const writeSyncTime = async(timestamp: number) => {
        await cube().connect()

        if (!encryptionKeys) {
            throw cubeErrors.invalidKeys(`Missing keys for cube ${cube().id}`)
        }

        const command = await encodeCommand({
            timeSync: {
                timestamp,
            },
        }, { keys: encryptionKeys })

        await sendCommand(CHAR_TIME_SYNC_UUID, command)

        cube().disconnect()
    }

    const writeUnlock = async(lockId: number): Promise<number> => {
        await cube().connect()

        const value = await encodeCommand({
            unlock: { lockId },
        })

        const result = await sendCommandAndReadResult(CHAR_UNLOCK_UUID, value)

        cube().disconnect()
        return result
    }

    const writeUnlockWithCustomCommand = async(command: Uint8Array): Promise<number> => {
        await cube().connect()

        const result = await sendCommandAndReadResult(CHAR_UNLOCK_UUID, new DataView(command))

        cube().disconnect()
        return result
    }

    const writeSetKey = async(keyIndex: number, publicKey: Uint8Array, expireAt: number) => {
        await cube().connect()

        if (!encryptionKeys) {
            throw cubeErrors.invalidKeys(`Missing keys for cube ${cube().id}`)
        }

        const value = await encodeCommand({
            setKey: {
                keyIndex,
                expireAt,
                publicKey,
            },
        }, { keys: encryptionKeys })

        await cube().write(SERVICE_UUID, CHAR_SET_KEY_UUID, value)

        cube().disconnect()
    }

    const writeFactoryReset = async() => {
        await cube().connect()
        cube().disconnect()
    }

    const readBattery = async(): Promise<number> => {
        await cube().connect()

        const value = await cube().read(SERVICE_BATTERY_UUID, CHAR_BATTERY_LEVEL_UUID)

        cube().disconnect()
        return value.getUint8(0)
    }

    return {
        setEncryptionKeys,
        writeSyncTime,
        writeUnlock,
        writeUnlockWithCustomCommand,
        writeSetKey,
        writeFactoryReset,
        readBattery,
    }
}
