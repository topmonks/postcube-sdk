
import {
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
    CHAR_BATTERY_LEVEL_UUID,
    CHAR_UNLOCK_UUID,
    CHAR_SET_KEY_UUID,
    CHAR_TIME_SYNC_UUID,
    CHAR_RESULT_UUID,
} from '../constants/bluetooth'
import { Cube, CubeCommands } from './cube'

export const cubeCommands = (cube: () => Cube): CubeCommands => {
    const sendEncryptedPacket = (encryption: 'secret'|'key', payload: Buffer) => {
    }

    const sendPacket = (commandId: number, expireAt: number, command: Buffer) => {
    }

    const getBattery = async(): Promise<number> => {
        await cube().connect()

        await cube().read(SERVICE_BATTERY_UUID, CHAR_BATTERY_LEVEL_UUID)

        const value = await cube().read(SERVICE_UUID, CHAR_RESULT_UUID)

        cube().disconnect()
        return value.getUint8(0)
    }

    const syncTime = async(timestamp: number) => {
        await cube().connect()

        const buffer = Buffer.from([])
        await cube().write(SERVICE_UUID, CHAR_TIME_SYNC_UUID, new DataView(buffer))

        cube().disconnect()
    }

    const unlock = async(lockId: number) => {
        await cube().connect()

        const buffer = Buffer.from([])
        await cube().write(SERVICE_UUID, CHAR_UNLOCK_UUID, new DataView(buffer))

        cube().disconnect()
    }

    const setKey = async(keyIndex: number, publicKey: Buffer, expireAt: number) => {
        await cube().connect()

        const buffer = Buffer.from([])
        await cube().write(SERVICE_UUID, CHAR_SET_KEY_UUID, new DataView(buffer))

        cube().disconnect()
    }

    const factoryReset = async() => {
        await cube().connect()
        cube().disconnect()
    }

    return {
        getBattery,
        syncTime,
        unlock,
        setKey,
        factoryReset,
    }
}
