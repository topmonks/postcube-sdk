
import { jSignal, Listener } from 'jsignal'

import * as protocol from '../../protocol.pb'
import { PostCubeLogger } from '../../logger'
import {
    PACKET_SIZE,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
    CHAR_BATTERY_LEVEL_UUID,
    CHAR_CONTROL_UUID,
    CHAR_RESULT_UUID,
    RES_OK,
    RES_INVALID_CMD,
} from '../../constants/bluetooth'
import { bleErrors } from '../../errors'
import {
    PostCube,
    ScanOptions,
    ScanResult,
    StopNotifications,
} from '../postcube'
import {
    encodeResult,
    chunkBuffer,
    parseBufferChunk,
    decodeChunkedPacket,
} from '../../encoding'

export interface MockDeviceConfig {
    deviceId: string
    name: string
    batteryLevel?: number
    connectDelayMs?: number
    failOnConnect?: boolean
}

export interface PostCubeMockConfig {
    availableDevices: MockDeviceConfig[]
}

export const postCubeMockConfig: PostCubeMockConfig = {
    availableDevices: [],
}

export const isEnabledMock = async(): Promise<boolean> => {
    return true
}

export const requestPostCubeMock = async(
    namePrefix: string,
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
    config: PostCubeMockConfig = postCubeMockConfig,
): Promise<PostCube> => {
    if (config.availableDevices.length > 0) {
        return new PostCubeMock(config, config.availableDevices[0])
    }

    await new Promise(resolve => setTimeout(resolve, 60000))
}

export const scanForPostCubesMock = async(
    options: ScanOptions = {},
    services: string[] = [ SERVICE_BATTERY_UUID, SERVICE_UUID ],
    config: PostCubeMockConfig = postCubeMockConfig,
): Promise<ScanResult> => {
    return {
        async stopScan() {},
        promise: requestPostCubeMock(options.namePrefix, services, config).then(postCube => {
            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(postCube)
            }
        }),
    }
}



const validateCharacteristic = (serviceUUID: string, characteristicUUID: string) => {
    switch (serviceUUID) {
    case SERVICE_BATTERY_UUID:
        if (characteristicUUID === CHAR_BATTERY_LEVEL_UUID) {
            break
        }

        throw bleErrors.unknownBLECharacteristic()
    case SERVICE_UUID:
        if (characteristicUUID === CHAR_CONTROL_UUID || characteristicUUID === CHAR_RESULT_UUID) {
            break
        }

        throw bleErrors.unknownBLECharacteristic()
    default:
        throw bleErrors.unknownBLEService()
    }
}

interface PostCubeMockCharacteristic {
    readValue(): Promise<DataView>
    writeValue(value: DataView): Promise<void>
    listenForValueChange(onChange: Listener<DataView>): () => void
}

const PostCubeMockCharacteristic = (postCubeMock: PostCubeMock, serviceUUID: string, characteristicUUID: string) => {
    const onCurrentValueChange: jSignal<DataView> = new jSignal<DataView>()

    let commandBuffer: number[][] = []
    let currentValue: DataView = new DataView(new Uint8Array(PACKET_SIZE).buffer)

    if (serviceUUID === SERVICE_BATTERY_UUID && characteristicUUID === CHAR_BATTERY_LEVEL_UUID) {
        const batteryLevel = postCubeMock.deviceConfig.batteryLevel || 10 + Math.round(Math.random() * 50)
        currentValue.setUint8(0, batteryLevel)
    }

    onCurrentValueChange.listen(async() => {
        if (serviceUUID !== SERVICE_UUID || characteristicUUID !== CHAR_CONTROL_UUID) {
            return
        }

        const { buffer, isLast } = await parseBufferChunk(currentValue)
        commandBuffer.push(buffer)

        if (isLast) {
            await processCommand()
        }
    })

    const processCommand = async() => {
        let packet: protocol.Packet

        try {
            packet = await decodeChunkedPacket(commandBuffer)
        } catch (err) {
            throw err
        } finally {
            commandBuffer = []
        }

        let resultCode = 0
        switch (true) {
        case !!packet.timeSync:
            resultCode = RES_OK
            break
        case !!packet.unlock:
            resultCode = RES_OK
            break
        case !!packet.setKey:
            resultCode = RES_OK
            break
        case !!packet.nuke:
            resultCode = RES_OK
            break
        default:
            resultCode = RES_INVALID_CMD
            break
        }

        const result = await encodeResult(packet.commandId, resultCode)
        const chunks = await chunkBuffer(result)

        const characteristic = await postCubeMock.getCharacteristic(SERVICE_UUID, CHAR_RESULT_UUID)
        for (const chunk of chunks) {
            await characteristic.writeValue(chunk)
        }
    }

    return {
        async readValue(): Promise<DataView> {
            return currentValue
        },
        async writeValue(value: DataView): Promise<void> {
            currentValue = value
            onCurrentValueChange.dispatch(currentValue)
        },
        listenForValueChange(onChange: Listener<DataView>) {
            onCurrentValueChange.listen(onChange)

            return () =>
                onCurrentValueChange.unlisten(onChange)
        },
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

        if (this.characteristics[`${serviceUUID}_${characteristicUUID}`]) {
            return this.characteristics[`${serviceUUID}_${characteristicUUID}`]
        }

        const characteristic = PostCubeMockCharacteristic(this, serviceUUID, characteristicUUID)
        this.characteristics[`${serviceUUID}_${characteristicUUID}`] = characteristic
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
