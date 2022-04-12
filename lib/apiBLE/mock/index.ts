
import { jSignal, Listener } from 'jsignal'

import { PostCubeLogger } from '../../logger'
import {
    PostCubeVersion,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    DEFAULT_TIMEOUT_IO,
    DEFAULT_TIMEOUT_LISTEN,
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
} from '../../constants/bluetooth'
import { bleErrors } from '../../errors'
import {
    PostCube,
    ScanOptions,
    ScanResult,
    StopNotifications,
} from '../postcube'
import {
    validateCharacteristic,
    PostCubeMockCharacteristic,
} from './characteristic'

export interface MockDeviceConfig {
    deviceId: string
    name: string
    batteryLevel?: number

    connectDelayMs?: number
    failOnConnect?: boolean

    controlPacketDelayMs?: number
    resultPacketDelayMs?: number

    timeSyncResult?: number
    timeSyncDelayMs?: number

    unlockResult?: number
    unlockDelayMs?: number

    setKeyResult?: number
    setKeyDelayMs?: number

    factoryResetResult?: number
    factoryResetDelayMs?: number
}

export interface PostCubeMockConfig {
    availableDevices: MockDeviceConfig[]
}

export const postCubeMockConfig: PostCubeMockConfig = {
    availableDevices: [],
}

export const getServiceUUID = (): string => {
    return SERVICE_UUID
}

export const isEnabled = async(): Promise<boolean> => {
    return true
}

export const requestPostCube = async(
    namePrefix: string,
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
    config: PostCubeMockConfig = postCubeMockConfig,
): Promise<PostCube> => {
    for (const mockDeviceConfig of config.availableDevices) {
        if (~mockDeviceConfig.name.indexOf(namePrefix)) {
            return new PostCubeMock(config, config.availableDevices[0])
        }
    }

    await new Promise(resolve => setTimeout(resolve, 60000))
}

export const scanForPostCubes = async(
    options: ScanOptions = {},
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
    config: PostCubeMockConfig = postCubeMockConfig,
): Promise<ScanResult> => {
    const abortSignal = new jSignal()
    let scanTimeout

    const handleDiscovery = (mockDeviceConfig: MockDeviceConfig) => {
        try {
            const postCube = new PostCubeMock(config, mockDeviceConfig)

            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(postCube)
            }
        } catch (err) {
            // console.error(err)
        }
    }

    const stopScan = async() => {
        if (scanTimeout) {
            clearTimeout(scanTimeout)
        }

        scanTimeout = null
        abortSignal.dispatch()
    }

    const startScan = async(): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            abortSignal.listen(resolve)

            if (options?.timeout && options.timeout > 0) {
                scanTimeout = setTimeout(stopScan, options.timeout)
            }

            for (const mockDeviceConfig of config.availableDevices) {
                await new Promise(resolve => setTimeout(resolve, Math.round(500 + Math.random() * 3000)))

                handleDiscovery(mockDeviceConfig)
            }
        })
    }

    return {
        async stopScan() {},
        promise: startScan(),
    }
}

export class PostCubeMock extends PostCube {
    static PlatformName = 'Mock'

    config: PostCubeMockConfig
    deviceConfig: MockDeviceConfig
    characteristics: {
        [service_characteristic: string]: PostCubeMockCharacteristic
    }

    get deviceId(): string {
        return this.deviceConfig?.deviceId
    }

    private _version: PostCubeVersion
    get version(): PostCubeVersion {
        return this._version
    }

    private _isConnected: boolean
    get isConnected(): boolean { return this._isConnected }
    set isConnected(isConnected: boolean) {
        this._isConnected = isConnected
        this.onChange.dispatch(this)
        // this.emit('change', this)
    }

    constructor(config: PostCubeMockConfig, deviceConfig: MockDeviceConfig) {
        super(deviceConfig?.name)

        this.config = config
        this.deviceConfig = deviceConfig
    }

    async getCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<PostCubeMockCharacteristic> {
        await validateCharacteristic(serviceUUID, characteristicUUID)

        const key = `${serviceUUID}_${characteristicUUID}`
// console.log(`getting char ${key}`)
// console.log(`this.characteristics[key]`,this.characteristics[key])
        if (this.characteristics[key]) {
            return this.characteristics[key]
        }

        const characteristic = PostCubeMockCharacteristic(this, serviceUUID, characteristicUUID)
// console.log('new characteristic:',characteristic)
        this.characteristics[key] = characteristic
        return characteristic
    }

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(`Connecting to PostCube (ID: ${this.id}) []`)

        let timeout, isConnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isConnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out connecting to PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)
            }, timeoutMs)
        }

        const connectDelayMs = this.deviceConfig.connectDelayMs || 200
        await new Promise(resolve => setTimeout(resolve, connectDelayMs))

        if (this.deviceConfig.failOnConnect) {
            throw bleErrors.unknownError('Mocking device connect fail')
        }

        this.isConnected = true
        isConnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(`Disconnecting from PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)

        let timeout, isDisconnected = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDisconnected) {
                    return
                }

                throw bleErrors.timeout(`Timed out disconnecting to PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)
            }, timeoutMs)
        }

        this.isConnected = false
        isDisconnected = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    async readV2(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<DataView> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID }, `Reading value from PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out reading value from PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)
            }, timeoutMs)
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        const value = characteristic.readValue()

        isDone = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        return value
    }

    async write(
        serviceUUID: string,
        characteristicUUID: string,
        value: DataView,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<void> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID, value }, `Writing value to PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)

        let timeout, isDone = false
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (isDone) {
                    return
                }

                throw bleErrors.timeout(`Timed out writing value to PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)
            }, timeoutMs)
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        await characteristic.writeValue(value)

        isDone = true
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    async listenForNotifications(serviceUUID: string, characteristicUUID: string, listener: Listener<DataView>, timeoutMs?: number): Promise<StopNotifications> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            `Listening for value change on PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`,
        )

        let timeout, isListening = true
        if (timeoutMs) {
            timeout = setTimeout(() => {
                if (!isListening) {
                    return
                }

                stopListening()
                throw bleErrors.timeout(`Timed out listening for value change on PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`)
            }, timeoutMs)
        }

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        const stopListeningForChange = characteristic.listenForValueChange((value: DataView) => {
            if (isListening && typeof listener === 'function') {
                listener(value)
            }
        })

        const stopListening = () => {
            PostCubeLogger.debug(
                { serviceUUID, characteristicUUID },
                `Stopped listening for value change on PostCube (ID: ${this.id}) [${PostCubeMock.PlatformName}]`,
            )

            isListening = false
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }

            stopListeningForChange()
        }

        return stopListening
    }
}
