
import * as pbjs from 'pbjs'
import * as moment from 'moment'

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
import * as protocol from './protocol.pb'

type Command = protocol.SetKey|protocol.Unlock|protocol.TimeSync|protocol.Nuke|protocol.Protect

export const cubeCommands = (cube: () => Cube): CubeCommands => {
    const sendPacketAndReadResult = async(characteristicUUID: string, buffer: Uint8Array) => {
        await cube().write(SERVICE_UUID, characteristicUUID, new DataView(buffer))

        // TODO: listen for result char's value change
    }

    // const composeEncryptedPacket = (encryption: 'secret'|'key', payload: Buffer) => {
    // }

    // const composePacket = (commandId: number, expireAt: number, command: Command) => {
    //     protocol.encodePacket({
    //         commandId,
    //         expireAt,
    //     })
    // }

    const syncTime = async(timestamp: number) => {
        await cube().connect()

        const commandIdBuffer = crypto.getRandomValues(new Uint32Array(1))

        const buffer = protocol.encodePacket({
            commandId: commandIdBuffer.buffer[0],
            expireAt: moment().add(1, 'day').unix(),
            timeSync: { timestamp },
        })

        await sendPacketAndReadResult(CHAR_TIME_SYNC_UUID, buffer)

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

    const getBattery = async(): Promise<number> => {
        await cube().connect()

        await cube().read(SERVICE_BATTERY_UUID, CHAR_BATTERY_LEVEL_UUID)

        const value = await cube().read(SERVICE_UUID, CHAR_RESULT_UUID)

        cube().disconnect()
        return value.getUint8(0)
    }

    return {
        syncTime,
        unlock,
        setKey,
        factoryReset,
        getBattery,
    }
}
