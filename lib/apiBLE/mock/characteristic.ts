
import { jSignal, Listener } from 'jsignal'

import * as protocol from '../../protocol.pb'
import { PostCubeLogger } from '../../logger'
import {
    MAX_PACKET_SIZE,
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
    encodeResultV2,
    chunkBufferV2,
    parseBufferChunkV2,
    decodeChunkedPacketV2,
} from '../../encoding'
import type { PostCubeMock } from './index'

export const validateCharacteristic = (serviceUUID: string, characteristicUUID: string) => {
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

export interface PostCubeMockCharacteristic {
    readValue(): Promise<DataView>
    writeValue(value: DataView): Promise<void>
    listenForValueChange(onChange: Listener<DataView>): () => void
}

export const PostCubeMockCharacteristic = (postCubeMock: PostCubeMock, serviceUUID: string, characteristicUUID: string) => {
    const onCurrentValueChange: jSignal<DataView> = new jSignal<DataView>()

    let commandBuffer: number[][] = []
    let currentValue: DataView = new DataView(new Uint8Array(MAX_PACKET_SIZE).buffer)

    if (serviceUUID === SERVICE_BATTERY_UUID && characteristicUUID === CHAR_BATTERY_LEVEL_UUID) {
        const batteryLevel = postCubeMock.deviceConfig.batteryLevel || 10 + Math.round(Math.random() * 50)
        currentValue.setUint8(0, batteryLevel)
    }

    onCurrentValueChange.listen(async() => {
        if (serviceUUID !== SERVICE_UUID || characteristicUUID !== CHAR_CONTROL_UUID) {
            return
        }

        const { buffer, isLast } = await parseBufferChunkV2(currentValue)
        commandBuffer.push(buffer)

        if (isLast) {
            await processCommand()
        }
    })

    const processCommand = async() => {
        try {
            const { encryptedPacket, packet } = await decodeChunkedPacketV2(commandBuffer)

            let resultCode = 0
            switch (true) {
            case !!packet.timeSync:
                if (postCubeMock.deviceConfig.timeSyncDelayMs) {
                    await new Promise(resolve => setTimeout(resolve, postCubeMock.deviceConfig.timeSyncDelayMs))
                }

                resultCode = postCubeMock.deviceConfig.timeSyncResult ?
                    postCubeMock.deviceConfig.timeSyncResult : RES_OK
                break
            case !!packet.unlock:
                if (postCubeMock.deviceConfig.unlockDelayMs) {
                    await new Promise(resolve => setTimeout(resolve, postCubeMock.deviceConfig.unlockDelayMs))
                }

                resultCode = postCubeMock.deviceConfig.unlockResult ?
                    postCubeMock.deviceConfig.unlockResult : RES_OK
                break
            case !!packet.setKey:
                if (postCubeMock.deviceConfig.setKeyDelayMs) {
                    await new Promise(resolve => setTimeout(resolve, postCubeMock.deviceConfig.setKeyDelayMs))
                }

                resultCode = postCubeMock.deviceConfig.setKeyResult ?
                    postCubeMock.deviceConfig.setKeyResult : RES_OK

                if (resultCode === RES_OK) {
                    // postCubeMock.setKeyIndex(packet.setKey.keyIndex)
                    // postCubeMock.setPublicKey(packet.setKey.publicKey)
                }
                break
            case !!packet.nuke:
                if (postCubeMock.deviceConfig.factoryResetDelayMs) {
                    await new Promise(resolve => setTimeout(resolve, postCubeMock.deviceConfig.factoryResetDelayMs))
                }

                resultCode = postCubeMock.deviceConfig.factoryResetResult ?
                    postCubeMock.deviceConfig.factoryResetResult : RES_OK
                break
            default:
                resultCode = RES_INVALID_CMD
                break
            }

            const result = await encodeResultV2(encryptedPacket.commandId, resultCode)
            const chunks = await chunkBufferV2(result)

            const characteristic = await postCubeMock.getCharacteristic(SERVICE_UUID, CHAR_RESULT_UUID)
            for (const chunk of chunks) {
                const resultPacketDelayMs = postCubeMock.deviceConfig.resultPacketDelayMs || 250
                await new Promise(resolve => setTimeout(resolve, resultPacketDelayMs))

                await characteristic.writeValue(chunk)
            }
        } catch (err) {
            throw err
        } finally {
            commandBuffer = []
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
