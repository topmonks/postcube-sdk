
import { jSignal } from 'jsignal'

import { bleErrors } from '../errors'
import { PostCubeLogger } from '../logger'
import { SERVICE_BATTERY_UUID, SERVICE_UUID } from '../constants/bluetooth'
import {
    PostCube,
    ScanOptions,
    ScanResult,
} from './postcube'
import {
    isEnabledWeb,
    requestPostCubeWeb,
    scanForPostCubesWeb,
} from './postcube.web'
import {
    isEnabledCapacitor,
    requestPostCubeCapacitor,
    scanForPostCubesCapacitor,
} from './postcube.capacitor'

export enum Platform {
    web       = 'web',
    capacitor = 'capacitor',
    node      = 'node',
}

export interface PostCubeBLE {
    readonly onChange: jSignal<PostCubeBLE>
    readonly onCubeDiscovered: jSignal<PostCube>

    platform: Platform

    isEnabled(): Promise<boolean>
    requestPostCube(namePrefix: string): Promise<PostCube>
    scanForPostCubes(options?: ScanOptions): Promise<ScanResult>
}

const isEnabled = async(): Promise<boolean> => {
    switch (PostCubeBLE.platform) {
    case Platform.web:
        return isEnabledWeb()
    case Platform.capacitor:
        return isEnabledCapacitor()
    case Platform.node:
        const { isEnabledNode } = await import('./postcube.node')
        return isEnabledNode()
    }

    throw bleErrors.invalidPlatform()
}

const requestPostCube = async(namePrefix: string): Promise<PostCube> => {
    PostCubeLogger.debug({ platform: PostCubeBLE.platform }, 'Requesting PostCube')

    let postCube: PostCube
    switch (PostCubeBLE.platform) {
    case Platform.web:
        postCube = await requestPostCubeWeb(namePrefix, [ SERVICE_BATTERY_UUID, SERVICE_UUID ])
        break
    case Platform.capacitor:
        postCube = await requestPostCubeCapacitor(namePrefix, [ SERVICE_BATTERY_UUID, SERVICE_UUID ])
        break
    case Platform.node:
        const { requestPostCubeNode } = await import('./postcube.node')
        postCube = await requestPostCubeNode(namePrefix, [ SERVICE_BATTERY_UUID, SERVICE_UUID ])
        break
    default:
        throw bleErrors.invalidPlatform()
    }

    PostCubeLogger.debug({
        platform: PostCubeBLE.platform,
        postCube,
    }, 'PostCube found')

    return postCube
}

const scanForPostCubes = async(options: ScanOptions = {}): Promise<ScanResult> => {
    PostCubeBLE.onChange.dispatch(PostCubeBLE)

    const _options: ScanOptions = {
        ...options,
        onDiscovery: cube => {
            PostCubeBLE.onCubeDiscovered.dispatch(cube)

            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(cube)
            }
        },
    }

    PostCubeLogger.debug({
        platform: PostCubeBLE.platform,
        options: _options,
    }, 'Scanning for PostCube with options')

    switch (PostCubeBLE.platform) {
    case Platform.web:
        return scanForPostCubesWeb(_options, [ SERVICE_BATTERY_UUID, SERVICE_UUID ])
    case Platform.capacitor:
        return scanForPostCubesCapacitor(_options, [ SERVICE_BATTERY_UUID, SERVICE_UUID ])
    case Platform.node:
        const { scanForPostCubesNode } = await import('./postcube.node')
        return scanForPostCubesNode(_options, [ SERVICE_BATTERY_UUID, SERVICE_UUID ])
    }

    throw bleErrors.invalidPlatform()
}

let platform: Platform = Platform.web

export const PostCubeBLE: PostCubeBLE = {
    onChange: new jSignal<PostCubeBLE>(),
    onCubeDiscovered: new jSignal<PostCube>(),
    get platform(): Platform { return platform },
    set platform(value: Platform) {
        if (!~Object.keys(Platform).indexOf(value)) {
            throw bleErrors.invalidPlatform(`Invalid platform '${value}'`)
        }

        platform = value
    },
    isEnabled,
    requestPostCube,
    scanForPostCubes,
}
