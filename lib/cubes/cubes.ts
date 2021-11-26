
import { jSignal } from 'jsignal'
import { unionBy } from 'lodash'

import { cubeErrors } from '../errors'
import { SERVICE_UUID } from '../constants/bluetooth'
import {
    Cube,
    ScanOptions,
    ScanResult,
} from './cube'
import {
    isEnabledWeb,
    requestCubeWeb,
    scanForCubesWeb,
} from './cube.web'
import {
    isEnabledCapacitor,
    requestCubeCapacitor,
    scanForCubesCapacitor,
} from './cube.capacitor'

export enum Platform {
    web       = 'web',
    capacitor = 'capacitor',
}

export interface Cubes {
    readonly onChange: jSignal<Cubes>
    readonly onCubeDiscovered: jSignal<Cube>

    platform: Platform

    isEnabled(): Promise<boolean>
    requestCube(namePrefix: string, services?: string[]): Promise<Cube>
    scanForCubes(options?: ScanOptions): Promise<ScanResult>
}

const isEnabled = async(): Promise<boolean> => {
    switch (Cubes.platform) {
    case Platform.web:
        return isEnabledWeb()
    case Platform.capacitor:
        return isEnabledCapacitor()
    }

    throw cubeErrors.invalidPlatform()
}

const requestCube = async(namePrefix: string, services: string[] = [SERVICE_UUID]): Promise<Cube> => {
    let cube: Cube
    switch (Cubes.platform) {
    case Platform.web:
        cube = await requestCubeWeb(namePrefix, services)
        break
    case Platform.capacitor:
        cube = await requestCubeCapacitor(namePrefix, services)
        break
    default:
        throw cubeErrors.invalidPlatform()
    }

    return cube
}

const scanForCubes = async(options: ScanOptions = {}): Promise<ScanResult> => {
    Cubes.onChange.dispatch(Cubes)

    const _options: ScanOptions = {
        ...options,
        onDiscovery: cube => {
            Cubes.onCubeDiscovered.dispatch(cube)

            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(cube)
            }
        },
    }

    switch (Cubes.platform) {
    case Platform.web:
        return scanForCubesWeb(_options)
    case Platform.capacitor:
        return scanForCubesCapacitor(_options)
    }

    throw cubeErrors.invalidPlatform()
}

let platform: Platform = Platform.web

export const Cubes: Cubes = {
    onChange: new jSignal<Cubes>(),
    onCubeDiscovered: new jSignal<Cube>(),
    get platform(): Platform { return platform },
    set platform(value: Platform) {
        if (!~Object.keys(Platform).indexOf(value)) {
            throw cubeErrors.invalidPlatform(`Invalid platform '${value}'`)
        }

        platform = value
    },
    isEnabled,
    requestCube,
    scanForCubes,
}
