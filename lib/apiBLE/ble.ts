
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

const allPlatforms = [
    Platform.web,
    Platform.capacitor,
    Platform.node,
    Platform.mock,
]

const platforms: {
    [platform in Platform]: any
} = {
    [Platform.web]: null,
    [Platform.capacitor]: null,
    [Platform.node]: null,
    [Platform.mock]: null,
}

const platformImports: {
    [platform in Platform]: any
} = {
    [Platform.web]: import('./postcube.web'),
    [Platform.capacitor]: import('./postcube.capacitor'),
    [Platform.node]: import('./postcube.node'),
    [Platform.mock]: import('./postcube.mock'),
}

allPlatforms.forEach(platform => {
    if (platformImports[platform]) {
        platformImports[platform].then(pkg => {
            console.log(`Imported package ${platform}: ${pkg}`)
            platforms[platform] = pkg
        }).catch(err => {
            console.log(`Could not import package ${platform}: ${err}`)
        })
    }
})


// allPlatforms.forEach(platform => {
//     import(`./postcube.${platform}`).then(pkg => {
//         platforms[platform] = pkg
//     }).catch(() => {})
// })

export interface PostCubeBLE {
    readonly onChange: jSignal<PostCubeBLE>
    readonly onCubeDiscovered: jSignal<PostCube>

    platform: Platform

    isEnabled(): Promise<boolean>
    requestPostCube(namePrefix: string): Promise<PostCube>
    scanForPostCubes(options?: ScanOptions): Promise<ScanResult>
}

const isEnabled = async(): Promise<boolean> => {
    if (!platforms[PostCubeBLE.platform]) {
        throw bleErrors.invalidPlatform(`Platform ${PostCubeBLE.platform} is unavailable`)
    }

    return platforms[PostCubeBLE.platform].isEnabled()
}

const requestPostCube = async(namePrefix: string, mockConfig?: PostCubeMockConfig): Promise<PostCube> => {
    PostCubeLogger.debug({ platform: PostCubeBLE.platform }, 'Requesting PostCube')

    if (!platforms[PostCubeBLE.platform]) {
        throw bleErrors.invalidPlatform(`Platform ${PostCubeBLE.platform} is unavailable`)
    }

    const postCube: PostCube = await platforms[PostCubeBLE.platform].requestPostCube(
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
    if (!platforms[PostCubeBLE.platform]) {
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

    return platforms[PostCubeBLE.platform].scanForPostCubes(_options, [ SERVICE_BATTERY_UUID, SERVICE_UUID ], mockConfig)
}

let platform: Platform

export const PostCubeBLE: PostCubeBLE = {
    onChange: new jSignal<PostCubeBLE>(),
    onCubeDiscovered: new jSignal<PostCube>(),
    get platform(): Platform {
        if (!platform) {
            const keys = Object.keys(platforms)

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
