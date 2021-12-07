
import { jSignal, Listener } from 'jsignal'

import { PostCubeLogger } from '../../logger'
import {
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
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
    config: PostCubeMockConfig
    deviceConfig: MockDeviceConfig
    characteristics: {
        [service_characteristic: string]: PostCubeMockCharacteristic
    }

    get deviceId(): string {
        return this.deviceConfig?.deviceId
    }

    private _isConnected: boolean
    get isConnected(): boolean { return this._isConnected }
    set isConnected(isConnected: boolean) {
        this._isConnected = isConnected
        this.emit('change', this)
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
        PostCubeLogger.debug(`Connecting to PostCube (ID: ${this.id}) [Mock]`)

        const connectDelayMs = this.deviceConfig.connectDelayMs || 200
        await new Promise(resolve => setTimeout(resolve, connectDelayMs))

        if (this.deviceConfig.failOnConnect) {
            throw bleErrors.unknownError('Mocking device connect fail')
        }

        this.isConnected = true
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(`Disconnecting from PostCube (ID: ${this.id}) [Mock]`)

        this.isConnected = false
    }

    async read(serviceUUID: string, characteristicUUID: string): Promise<DataView> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID }, `Reading value from PostCube (ID: ${this.id}) [Mock]`)

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        return characteristic.readValue()
    }

    async write(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID, value }, `Writing value to PostCube (ID: ${this.id}) [Mock]`)

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        await characteristic.writeValue(value)
    }

    async listenForNotifications(serviceUUID: string, characteristicUUID: string, listener: Listener<DataView>): Promise<StopNotifications> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            `Listening for value change on PostCube (ID: ${this.id}) [Mock]`,
        )

        const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)
        const stopListeningForChange = characteristic.listenForValueChange(listener)

        return () => {
            PostCubeLogger.debug(
                { serviceUUID, characteristicUUID },
                `Stopped listening for value change on PostCube (ID: ${this.id}) [Mock]`,
            )

            stopListeningForChange()
        }
    }
}
