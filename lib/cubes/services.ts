
import {
    SERVICE_BATTERY_UUID,
    CHAR_BATTERY_LEVEL_UUID,
} from '../constants/bluetooth'
import { Cube, CubeServices } from './cube'

export const cubeServices = (cube: () => Cube): CubeServices => {
    const transaction = async<T>(exec: () => T): Promise<T> => {
        await cube().connect()
        const result = await exec()

        return cube().disconnect()
            .catch(console.error)
            .then(() => Promise.resolve(result))
    }

    const getBattery = async(): Promise<number> => {
        return await cube().transaction(async() => {
            const value = await cube().read(SERVICE_BATTERY_UUID, CHAR_BATTERY_LEVEL_UUID)
            return value.getUint8(0)
        })
    }

    const syncTime = async() => {
        return await cube().transaction(async() => {
            return null
        })
    }

    const unlock = async() => {
        return await cube().transaction(async() => {
            return null
        })
    }

    const setKey = async() => {
        return await cube().transaction(async() => {
            return null
        })
    }

    const factoryReset = async() => {
        return await cube().transaction(async() => {
            return null
        })
    }

    return {
        transaction,
        getBattery,
        syncTime,
        unlock,
        setKey,
        factoryReset,
    }
}
