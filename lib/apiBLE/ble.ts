
import { jSignal } from 'jsignal'

import { bleErrors } from '../errors'
import { PostCubeLogger } from '../logger'
import { SERVICE_BATTERY_UUID, SERVICE_UUID } from '../constants/bluetooth'
import {
    PostCube,
    ScanOptions,
    ScanResult,
} from './postcube'
import type { PostCubeMockConfig } from './postcube.mock'

export enum Platform {
    web       = 'web',
    capacitor = 'capacitor',
    node      = 'node',
    mock      = 'mock',
}

import * as postcubeMock from './postcube.mock'
import * as postcubeWeb from './postcube.web'
import * as postcubeCapacitor from './postcube.capacitor'
import * as postcubeNode from './postcube.node'

const platformMap: {
    [platform in Platform]: any
} = {
    [Platform.web]:       postcubeWeb,
    [Platform.capacitor]: postcubeCapacitor,
    [Platform.node]:      postcubeNode,
    [Platform.mock]:      postcubeMock,
}

export interface PostCubeBLE {
    readonly onChange: jSignal<PostCubeBLE>
    readonly onCubeDiscovered: jSignal<PostCube>

    platform: Platform

    isEnabled(): Promise<boolean>
    requestPostCube(namePrefix: string, mockConfig?: PostCubeMockConfig): Promise<PostCube>
    scanForPostCubes(options?: ScanOptions, mockConfig?: PostCubeMockConfig): Promise<ScanResult>
}

const isEnabled = async(): Promise<boolean> => {
    if (!platformMap[PostCubeBLE.platform] || typeof platformMap[PostCubeBLE.platform].isEnabled !== 'function') {
        throw bleErrors.invalidPlatform(`Platform ${PostCubeBLE.platform} is unavailable`)
    }

    return platformMap[PostCubeBLE.platform].isEnabled()
}

const requestPostCube = async(namePrefix: string, mockConfig?: PostCubeMockConfig): Promise<PostCube> => {
    PostCubeLogger.debug({ platform: PostCubeBLE.platform }, 'Requesting PostCube')

    if (!platformMap[PostCubeBLE.platform] || typeof platformMap[PostCubeBLE.platform].requestPostCube !== 'function') {
        throw bleErrors.invalidPlatform(`Platform ${PostCubeBLE.platform} is unavailable`)
    }

    const postCube: PostCube = await platformMap[PostCubeBLE.platform].requestPostCube(
        namePrefix,
        [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
        mockConfig,
    )

    PostCubeLogger.debug({
        platform: PostCubeBLE.platform,
        postCube,
    }, 'PostCube found')

    return postCube
}

const scanForPostCubes = async(options: ScanOptions = {}, mockConfig?: PostCubeMockConfig): Promise<ScanResult> => {
    if (!platformMap[PostCubeBLE.platform] || typeof platformMap[PostCubeBLE.platform].scanForPostCubes !== 'function') {
        throw bleErrors.invalidPlatform(`Platform ${PostCubeBLE.platform} is unavailable`)
    }

    PostCubeBLE.onChange.dispatch(PostCubeBLE)

    const _options: ScanOptions = {
        ...options,
        onDiscovery: postCube => {
            PostCubeBLE.onCubeDiscovered.dispatch(postCube)

            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(postCube)
            }
        },
    }

    PostCubeLogger.debug({
        platform: PostCubeBLE.platform,
        options: _options,
    }, 'Scanning for PostCube with options')

    return platformMap[PostCubeBLE.platform].scanForPostCubes(_options, [ SERVICE_BATTERY_UUID, SERVICE_UUID ], mockConfig)
}

let platform: Platform

export const PostCubeBLE: PostCubeBLE = {
    onChange: new jSignal<PostCubeBLE>(),
    onCubeDiscovered: new jSignal<PostCube>(),
    get platform(): Platform {
        if (!platform) {
            const keys = Object.keys(platformMap)

            if (keys.length > 0) {
                platform = keys[0] as Platform
            }
        }

        return platform
    },
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
