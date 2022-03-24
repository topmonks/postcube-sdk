
import { expect } from 'chai'
import { chunk } from 'lodash'

import {
    expectedEncodedCommandsMap,
    expectedEncodedPacketsMap,
    expectedEncodedResultsMap,
} from '../data'
import {
    PACKET_SIZE,
    PACKET_LAST_INDEX,
    PACKET_LAST_FALSE,
    PACKET_LAST_TRUE,
} from '../../lib/constants/bluetooth'
import { parseSecretCode } from '../../lib/helpers'
import {
    Command,
    EncodingEncryptionStrategy,
    encodeCommand,
    encodeResult,
    chunkBuffer,
    parseBufferChunk,
    decodeChunkedResult,
    decodeChunkedPacket,
} from '../../lib/encoding'
import { hashSHA256 } from '../../lib/encoding/hash'
import { BleErrorCode } from '../../lib/errors'

const getRandomByte = () =>
    Math.floor(Math.random() * (0xff - 1))

const getRandomizedArrayBuffer = (length: number): ArrayBuffer => {
    const arrayBuffer = new ArrayBuffer(length)

    for (let index = 0; index < arrayBuffer.byteLength; index++) {
        arrayBuffer[index] = getRandomByte()
    }

    return arrayBuffer
}

const getRandomizedDataView = (length: number): DataView => {
    const dataView = new DataView(new ArrayBuffer(length))

    for (let index = 0; index < length; index++) {
        dataView.setUint8(index, getRandomByte())
    }

    return dataView
}

export const runEncodingTests = () => {
    it('should encode and decode command `setKey` using secret code', async() => {
        const {
            commandId,
            expireAt,
            boxId,
            secretCode,
            command,
            encodedPacket: expectedEncodedPacket,
        } = expectedEncodedCommandsMap.alpha

        const expectedHashedSecretCode = await hashSHA256([
            ...Buffer.from(boxId, 'utf-8'),
            ...parseSecretCode(secretCode),
        ])

        const encodedCommand = await encodeCommand(command, { commandId, expireAt, boxId, secretCode })

        const { encryptedPacket, packet } = await decodeChunkedPacket(chunk(encodedCommand, PACKET_SIZE - 1), { boxId, secretCode })

        expect(encryptedPacket?.commandId).to.equal(commandId)

        expect(encryptedPacket?.hash instanceof Uint8Array).to.be.true
        expect(encryptedPacket?.hash?.length).to.equal(expectedHashedSecretCode?.length)
        for (let index = 0; index < expectedHashedSecretCode?.length; index++) {
            expect(encryptedPacket.hash[index]).to.equal(expectedHashedSecretCode[index])
        }

        expect(encryptedPacket?.payload?.length).to.equal(expectedEncodedPacket?.length)
        for (let index = 0; index < expectedEncodedPacket?.length; index++) {
            expect(encryptedPacket.payload[index]).to.equal(expectedEncodedPacket[index])
        }

        expect(packet?.setKey?.expireAt).to.equal(command?.setKey?.expireAt)
        expect(packet?.setKey?.keyIndex).to.equal(command?.setKey?.keyIndex)

        expect(packet?.setKey?.publicKey?.length).to.equal(command?.setKey?.publicKey?.length)
        for (let index = 0; index < command?.setKey?.publicKey?.length; index++) {
            expect(packet.setKey.publicKey[index]).to.equal(command.setKey.publicKey[index])
        }
    })

    it('should encode and decode command `unlock` using shared secret key', async() => {
        const {
            commandId,
            expireAt,
            boxId,
            secretCode,
            privateKey,
            publicKey,
            keyIndex,
            command,
            encodedEncryptedPacket: expectedEncodedEncryptedPacket,
            encodedPacket: expectedEncodedPacket,
        } = expectedEncodedCommandsMap.beta

        const hashedSecretCode = await hashSHA256([
            ...Buffer.from(boxId, 'utf-8'),
            ...parseSecretCode(secretCode),
        ])

        const encodedCommand = await encodeCommand(command, {
            commandId,
            expireAt,
            keys: { hashedSecretCode, keyIndex, privateKey, publicKey },
        })

        expect(encodedCommand?.length).to.equal(expectedEncodedEncryptedPacket?.length)
        for (let index = 0; index < expectedEncodedEncryptedPacket?.length; index++) {
            expect(encodedCommand[index]).to.equal(expectedEncodedEncryptedPacket[index])
        }

        const { encryptedPacket, packet } = await decodeChunkedPacket(
            chunk(encodedCommand, PACKET_SIZE - 1),
            { keys: { hashedSecretCode, privateKey, publicKey } },
        )

        expect(encryptedPacket?.commandId).to.equal(commandId)
        expect(encryptedPacket?.encryptionKeyId).to.equal(keyIndex)

        expect(encryptedPacket?.payload?.length).to.equal(expectedEncodedPacket?.length)
        for (let index = 0; index < expectedEncodedPacket?.length; index++) {
            expect(encryptedPacket?.payload[index]).to.equal(expectedEncodedPacket[index])
        }

        expect(packet?.expireAt).to.equal(expireAt)

        expect(typeof packet?.unlock).to.equal('object')
        expect(packet?.unlock?.lockId).to.equal(command?.unlock?.lockId)
    })

    it('should encode and decode command `nuke` using shared secret key', async() => {
        const {
            commandId,
            expireAt,
            boxId,
            secretCode,
            privateKey,
            publicKey,
            keyIndex,
            command,
            encodedEncryptedPacket: expectedEncodedEncryptedPacket,
            encodedPacket: expectedEncodedPacket,
        } = expectedEncodedCommandsMap.gamma

        const hashedSecretCode = await hashSHA256([
            ...Buffer.from(boxId, 'utf-8'),
            ...parseSecretCode(secretCode),
        ])

        const encodedCommand = await encodeCommand(command, {
            commandId,
            expireAt,
            keys: { hashedSecretCode, keyIndex, privateKey, publicKey },
        })

        expect(encodedCommand?.length).to.equal(expectedEncodedEncryptedPacket?.length)
        for (let index = 0; index < expectedEncodedEncryptedPacket?.length; index++) {
            expect(encodedCommand[index]).to.equal(expectedEncodedEncryptedPacket[index])
        }

        const { encryptedPacket, packet } = await decodeChunkedPacket(
            chunk(encodedCommand, PACKET_SIZE - 1),
            { keys: { hashedSecretCode, privateKey, publicKey } },
        )

        expect(encryptedPacket?.commandId).to.equal(commandId)
        expect(encryptedPacket?.encryptionKeyId).to.equal(keyIndex)

        expect(encryptedPacket?.payload?.length).to.equal(expectedEncodedPacket?.length)
        for (let index = 0; index < expectedEncodedPacket?.length; index++) {
            expect(encryptedPacket?.payload[index]).to.equal(expectedEncodedPacket[index])
        }

        expect(packet?.expireAt).to.equal(expireAt)

        expect(typeof packet?.nuke).to.equal('object')
    })

    it('should encode and decode command `protect` using shared secret key', async() => {
        const {
            commandId,
            expireAt,
            boxId,
            secretCode,
            privateKey,
            publicKey,
            keyIndex,
            command,
            encodedEncryptedPacket: expectedEncodedEncryptedPacket,
            encodedPacket: expectedEncodedPacket,
        } = expectedEncodedCommandsMap.delta

        const hashedSecretCode = await hashSHA256([
            ...Buffer.from(boxId, 'utf-8'),
            ...parseSecretCode(secretCode),
        ])

        const encodedCommand = await encodeCommand(command, {
            commandId,
            expireAt,
            keys: { hashedSecretCode, keyIndex, privateKey, publicKey },
        })

        expect(encodedCommand?.length).to.equal(expectedEncodedEncryptedPacket?.length)
        for (let index = 0; index < expectedEncodedEncryptedPacket?.length; index++) {
            expect(encodedCommand[index]).to.equal(expectedEncodedEncryptedPacket[index])
        }

        const { encryptedPacket, packet } = await decodeChunkedPacket(
            chunk(encodedCommand, PACKET_SIZE - 1),
            { keys: { hashedSecretCode, privateKey, publicKey } },
        )

        expect(encryptedPacket?.commandId).to.equal(commandId)
        expect(encryptedPacket?.encryptionKeyId).to.equal(keyIndex)

        expect(encryptedPacket?.payload?.length).to.equal(expectedEncodedPacket?.length)
        for (let index = 0; index < expectedEncodedPacket?.length; index++) {
            expect(encryptedPacket?.payload[index]).to.equal(expectedEncodedPacket[index])
        }

        expect(packet?.expireAt).to.equal(expireAt)

        expect(typeof packet?.protect).to.equal('object')
    })

    it('should fail to encode empty command', async() => {
        const { boxId, secretCode } = expectedEncodedCommandsMap.alpha

        try {
            await encodeCommand({} as Command, { boxId, secretCode })

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidCommand)
        }
    })

    it('should fail to encode multiple commands', async() => {
        const { boxId, secretCode } = expectedEncodedCommandsMap.alpha

        try {
            await encodeCommand({
                unlock: { lockId: 3 },
                timeSync: { timestamp: 365648 },
            }, { boxId, secretCode })

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidCommand)
        }
    })

    it('should fail to encode non-`setKey` command using secret code', async() => {
        const { boxId, secretCode } = expectedEncodedCommandsMap.alpha

        try {
            await encodeCommand({
                unlock: { lockId: 3 },
            }, {
                encryptionStrategy: EncodingEncryptionStrategy.secretCode,
                boxId, secretCode,
            })

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidAuthentication)
        }
    })

    it('should encode result', async() => {
        const {
            commandId,
            value,
            errorCode,
            encodedResult: expectedEncodedResult,
        } = expectedEncodedResultsMap.alpha

        const encodedResult = await encodeResult(commandId, value, errorCode)

        expect(encodedResult.length).to.equal(expectedEncodedResult.length)

        for (let index = 0; index < expectedEncodedResult.length; index++) {
            expect(encodedResult[index]).to.equal(expectedEncodedResult[index])
        }
    })

    it('should chunk buffer', async() => {
        const buffer = getRandomizedArrayBuffer((PACKET_SIZE - 1) * 2)

        const chunkedBuffer = await chunkBuffer(buffer)

        expect(chunkedBuffer.length).to.equal(2)

        expect(chunkedBuffer[0].byteLength).to.equal(PACKET_SIZE)
        expect(chunkedBuffer[1].byteLength).to.equal(PACKET_SIZE)
    })

    it('should chunk buffer with 0x0 padding if necessary', async() => {
        const buffer = getRandomizedArrayBuffer(PACKET_SIZE * 2)

        const chunkedBuffer = await chunkBuffer(buffer)

        expect(chunkedBuffer.length).to.equal(3)

        for (let offset = 0; offset < 2 * PACKET_SIZE - 2 * (PACKET_SIZE - 1); offset++) {
            expect(chunkedBuffer[offset].byteLength).to.equal(PACKET_SIZE)
        }

        for (let offset = 0; offset < PACKET_SIZE; offset++) {
            if (offset === PACKET_LAST_INDEX) {
                expect(chunkedBuffer[2].getUint8(offset)).to.equal(PACKET_LAST_TRUE)
                continue
            }

            if (offset > 2) {
                expect(chunkedBuffer[2].getUint8(offset)).to.equal(0x0)
                continue
            }

            expect(chunkedBuffer[2].getUint8(offset)).to.equal(buffer[PACKET_SIZE + (PACKET_SIZE - 2) + (offset - 1)])
        }
    })

    it('should parse last chunk buffer', async() => {
        const chunk = getRandomizedDataView(PACKET_SIZE)
        chunk.setUint8(PACKET_LAST_INDEX, PACKET_LAST_TRUE)

        const chunkedPacket = await parseBufferChunk(chunk)

        expect(chunkedPacket.isLast).to.be.true
        expect(chunkedPacket.buffer.length).to.equal(PACKET_SIZE - 1)

        for (let index = 1; index < PACKET_SIZE; index++) {
            expect(chunkedPacket.buffer[index - 1]).to.equal(chunk.getUint8(index))
        }
    })

    it('should parse non-last chunk buffer', async() => {
        const chunk = getRandomizedDataView(PACKET_SIZE)
        chunk.setUint8(PACKET_LAST_INDEX, PACKET_LAST_FALSE)

        const chunkedPacket = await parseBufferChunk(chunk)

        expect(chunkedPacket.isLast).to.be.false
        expect(chunkedPacket.buffer.length).to.equal(PACKET_SIZE - 1)

        for (let index = 1; index < PACKET_SIZE; index++) {
            expect(chunkedPacket.buffer[index - 1]).to.equal(chunk.getUint8(index))
        }
    })

    it('should parse too long chunk buffer', async() => {
        const delta = 4

        const chunk = getRandomizedDataView(PACKET_SIZE + delta)
        chunk.setUint8(PACKET_LAST_INDEX, PACKET_LAST_TRUE)

        const chunkedPacket = await parseBufferChunk(chunk)

        expect(chunkedPacket.isLast).to.be.true
        expect(chunkedPacket.buffer.length).to.equal(PACKET_SIZE - 1)

        for (let index = 1; index < PACKET_SIZE; index++) {
            expect(chunkedPacket.buffer[index - 1]).to.equal(chunk.getUint8(index))
        }
    })

    it('should parse too short chunk buffer', async() => {
        const delta = 4

        const chunk = getRandomizedDataView(PACKET_SIZE - delta)
        chunk.setUint8(PACKET_LAST_INDEX, PACKET_LAST_TRUE)

        const chunkedPacket = await parseBufferChunk(chunk)

        expect(chunkedPacket.isLast).to.be.true
        expect(chunkedPacket.buffer.length).to.equal(PACKET_SIZE - 1 - delta)

        for (let index = 1; index < PACKET_SIZE - delta; index++) {
            expect(chunkedPacket.buffer[index - 1]).to.equal(chunk.getUint8(index))
        }
    })

    it('should decode chunked result', async() => {
        const {
            encodedResult,
            commandId: expectedCommandId,
            value: expectedValue,
            errorCode: expectedErrorCode,
        } = expectedEncodedResultsMap.alpha

        const result = await decodeChunkedResult(chunk(encodedResult, PACKET_SIZE - 1))

        expect(result?.commandId).to.equal(expectedCommandId)
        expect(result?.value).to.equal(expectedValue)
        expect(result?.errorCode).to.equal(expectedErrorCode)
    })

    it('should decode chunked packet (unencrypted; setKey)', async() => {
        const {
            encodedPacket,
            packet: expectedPacket,
        } = expectedEncodedPacketsMap.alpha

        const { packet } = await decodeChunkedPacket(chunk(encodedPacket, PACKET_SIZE - 1))

        expect(packet?.expireAt).to.equal(expectedPacket?.expireAt)

        expect(typeof packet?.setKey).to.equal('object')
        expect(packet?.setKey?.expireAt).to.equal(expectedPacket?.setKey?.expireAt)
        expect(packet?.setKey?.keyIndex).to.equal(expectedPacket?.setKey?.keyIndex)

        expect(packet?.setKey?.publicKey instanceof Uint8Array).to.be.true
        expect(packet?.setKey?.publicKey?.length).to.equal(expectedPacket?.setKey?.publicKey?.length)
        for (let index = 0; index < expectedPacket?.setKey?.publicKey?.length; index++) {
            expect(packet?.setKey?.publicKey[index]).to.equal(expectedPacket?.setKey?.publicKey[index])
        }
    })

    it('should decode chunked packet (unencrypted; unlock)', async() => {
        const {
            encodedPacket,
            packet: expectedPacket,
        } = expectedEncodedPacketsMap.beta

        const { packet } = await decodeChunkedPacket(chunk(encodedPacket, PACKET_SIZE - 1))

        expect(packet?.expireAt).to.equal(expectedPacket?.expireAt)

        expect(typeof packet?.unlock).to.equal('object')
        expect(packet?.unlock?.lockId).to.equal(expectedPacket?.unlock?.lockId)
    })

    it('should decode chunked packet (unencrypted; timeSync)', async() => {
        const {
            encodedPacket,
            packet: expectedPacket,
        } = expectedEncodedPacketsMap.gamma

        const { packet } = await decodeChunkedPacket(chunk(encodedPacket, PACKET_SIZE - 1))

        expect(packet?.expireAt).to.equal(expectedPacket?.expireAt)

        expect(typeof packet?.timeSync).to.equal('object')
        expect(packet?.timeSync?.timestamp).to.equal(expectedPacket?.timeSync?.timestamp)
    })

    it('should decode chunked packet (unencrypted; nuke)', async() => {
        const {
            encodedPacket,
            packet: expectedPacket,
        } = expectedEncodedPacketsMap.delta

        const { packet } = await decodeChunkedPacket(chunk(encodedPacket, PACKET_SIZE - 1))

        expect(packet?.expireAt).to.equal(expectedPacket?.expireAt)
        expect(typeof packet?.nuke).to.equal('object')
    })

    it('should decode chunked packet (unencrypted; protect)', async() => {
        const {
            encodedPacket,
            packet: expectedPacket,
        } = expectedEncodedPacketsMap.epsilon

        const { packet } = await decodeChunkedPacket(chunk(encodedPacket, PACKET_SIZE - 1))

        expect(packet?.expireAt).to.equal(expectedPacket?.expireAt)
        expect(typeof packet?.protect).to.equal('object')
    })
}
