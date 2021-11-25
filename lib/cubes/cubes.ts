
import { jSignal } from 'jsignal'

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
import {
    isEnabledNode,
    requestCubeNode,
    scanForCubesNode,
} from './cube.node'

export enum Platform {
    web       = 'web',
    capacitor = 'capacitor',
    node      = 'node',
}

export interface Cubes {
    readonly onChange: jSignal<Cubes>
    readonly onCubeDiscovered: jSignal<Cube>
    readonly isScanning: boolean
    readonly discoveredCubes: Cube[]

    platform: Platform

    isEnabled(): Promise<boolean>
    requestCube(namePrefix: string, services?: string[]): Promise<Cube>
    scanForCubes(options?: ScanOptions): Promise<ScanResult>
}

let platform: Platform = Platform.web
let isScanning: boolean = false
let discoveredCubes: Cube[] = []

const forgetDiscoveredCubes = () => {
    discoveredCubes = []

    Cubes.onChange.dispatch(Cubes)
}

const addDiscoveredCube = (cube: Cube) => {
    Cubes.onCubeDiscovered.dispatch(cube)

    discoveredCubes = [ cube, ...discoveredCubes]
        .filter(item => item.deviceId !== cube.deviceId)

    Cubes.onChange.dispatch(Cubes)
}

const isEnabled = async(): Promise<boolean> => {
    switch (Cubes.platform) {
    case Platform.web:
        return isEnabledWeb()
    case Platform.capacitor:
        return isEnabledCapacitor()
    case Platform.node:
        return isEnabledNode()
    }

    throw cubeErrors.invalidPlatform()
}

const requestCube = async(namePrefix: string, services: string[] = [SERVICE_UUID]): Promise<Cube> => {
    forgetDiscoveredCubes()

    let cube: Cube
    switch (Cubes.platform) {
    case Platform.web:
        cube = await requestCubeWeb(namePrefix, services)
        break
    case Platform.capacitor:
        cube = await requestCubeCapacitor(namePrefix, services)
        break
    case Platform.node:
        cube = await requestCubeNode(namePrefix, services)
        break
    default:
        throw cubeErrors.invalidPlatform()
    }

    addDiscoveredCube(cube)

    return cube
}

const scanForCubes = async(options: ScanOptions = {}): Promise<ScanResult> => {
    forgetDiscoveredCubes()

    const _options: ScanOptions = {
        ...options,
        onDiscovery: cube => {
            addDiscoveredCube(cube)

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
    case Platform.node:
        return scanForCubesNode(_options)
    }

    throw cubeErrors.invalidPlatform()
}

export const Cubes: Cubes = {
    onChange: new jSignal<Cubes>(),
    onCubeDiscovered: new jSignal<Cube>(),
    get isScanning(): boolean { return isScanning },
    get platform(): Platform { return platform },
    set platform(value: Platform) {
        if (!~Object.keys(Platform).indexOf(value)) {
            throw cubeErrors.invalidPlatform(`Invalid platform '${value}'`)
        }

        platform = value
    },
    isEnabled,
    discoveredCubes,
    requestCube,
    scanForCubes,
}
