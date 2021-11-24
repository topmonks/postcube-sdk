
import {
    SERVICE_UUID,

} from '../constants/bluetooth'
import { Cube, CubeServices } from './cube'

export const cubeServices = (cube: Cube): CubeServices => {
    return {
        getBattery() {
            return cube.transaction(async() => {
                const value = await cube.read('battery_service', 'battery_level')
                return value.getUint8(0)
            })
        },
        syncTime() {
            return cube.transaction(async() => {
            })
        },
        unlock() {
            return cube.transaction(async() => {
            })
        },
        setKey() {
            return cube.transaction(async() => {
            })
        },
        factoryReset() {
            return cube.transaction(async() => {
            })
        },
    }
}
