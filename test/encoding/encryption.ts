
import { expect } from 'chai'

import { expectedEncryptionKeysMap, expectedEncryptionDataMap } from '../data'
import { hashSHA256, hashSharedSecret } from '../../lib/encoding/hash'
import {
    generateKeyPair,
    cipher,
    decipher,
    deriveEncryptionKey,
    encrypt,
    decrypt,
} from '../../lib/encoding/encryption'

export const runEncryptionTests = () => {
    it('should hash shared secret', async() => {
        const commandId = 2047396996
        const sharedSecret = new Uint8Array([ 0x58, 0x68, 0x52, 0xfe ])

        const hashed = await hashSharedSecret(commandId, sharedSecret)

        expect(Buffer.from(hashed).toString('hex')).to.equal('62b7d0ec0abb052c57690f4e1610df587cab5704a15ea76b4596c8a7404f9bf3')
    })

    it('should generate new Uint8Array key pair using `prime256v1`', async() => {
        const { privateKey, publicKey } = await generateKeyPair()

        expect(privateKey instanceof Uint8Array).to.be.true
        expect(publicKey instanceof Uint8Array).to.be.true

        expect(privateKey.length).to.equal(32)
        expect(publicKey.length).to.equal(64)
    })

    it('should derive shared secret using `prime256v1` salted with commandId', async() => {
        const {
            privateKey,
            publicKey,
            commandId,
            encryptionKey: expectedEncryptionKey,
        } = expectedEncryptionKeysMap.alpha

        const encryptionKey = await deriveEncryptionKey(commandId, { privateKey, publicKey })

        expect(encryptionKey instanceof Uint8Array).to.be.true
        expect(encryptionKey.length).to.equal(32)

        for (const index in encryptionKey) {
            expect(encryptionKey[index]).to.equal(expectedEncryptionKey[index])
        }
    })

    it('should cipher data using `chacha20-poly1305`', async() => {
        const {
            boxId,
            secretCode,
            encryptionKey,
            decryptedData,
            encryptedData: expectedEncryptedData,
            authTag: expectedAuthTag,
        } = expectedEncryptionDataMap.alpha

        const hashedSecretCode = await hashSHA256([ ...Buffer.from(boxId, 'utf-8'), ...secretCode ])

        const { encrypted, authTag } = await cipher(encryptionKey, decryptedData, { hashedSecretCode })

        expect(encrypted instanceof Buffer).to.be.true
        expect(authTag instanceof Buffer).to.be.true

        expect(encrypted.length).to.equal(expectedEncryptedData.length)
        expect(authTag.length).to.equal(expectedAuthTag.length)

        for (let index = 0; index < expectedEncryptedData.length; index++) {
            expect(encrypted[index]).to.equal(expectedEncryptedData[index])
        }

        for (let index = 0; index < expectedAuthTag.length; index++) {
            expect(authTag[index]).to.equal(expectedAuthTag[index])
        }
    })

    it('should decipher data using `chacha20-poly1305`', async() => {
        const {
            boxId,
            secretCode,
            encryptionKey,
            encryptedData,
            decryptedData: expectedDecryptedData,
        } = expectedEncryptionDataMap.alpha

        const hashedSecretCode = await hashSHA256([ ...Buffer.from(boxId, 'utf-8'), ...secretCode ])

        const { decrypted } = await decipher(encryptionKey, encryptedData, { hashedSecretCode })

        expect(decrypted instanceof Buffer).to.be.true

        expect(decrypted.length).to.equal(expectedDecryptedData.length)

        for (let index = 0; index < expectedDecryptedData.length; index++) {
            expect(decrypted[index]).to.equal(expectedDecryptedData[index])
        }
    })

    it('should encrypt data using `prime256v1` derived shared secret and `chacha20-poly1305`', async() => {
        const {
            boxId,
            privateKey,
            publicKey,
            secretCode,
            commandId,
            decryptedData,
            encryptedData: expectedEncryptedData,
            authTag: expectedAuthTag,
        } = expectedEncryptionDataMap.alpha

        const hashedSecretCode = await hashSHA256([ ...Buffer.from(boxId, 'utf-8'), ...secretCode ])

        const { encrypted, authTag } = await encrypt(decryptedData, commandId, { privateKey, publicKey, hashedSecretCode })

        expect(encrypted instanceof Buffer).to.be.true
        expect(authTag instanceof Buffer).to.be.true

        expect(encrypted.length).to.equal(expectedEncryptedData.length)
        expect(authTag.length).to.equal(expectedAuthTag.length)

        for (let index = 0; index < expectedEncryptedData.length; index++) {
            expect(encrypted[index]).to.equal(expectedEncryptedData[index])
        }

        for (let index = 0; index < expectedAuthTag.length; index++) {
            expect(authTag[index]).to.equal(expectedAuthTag[index])
        }
    })

    it('should decrypt data using `prime256v1` derived shared secret and `chacha20-poly1305`', async() => {
        const {
            boxId,
            privateKey,
            publicKey,
            secretCode,
            commandId,
            encryptedData,
            decryptedData: expectedDecryptedData,
        } = expectedEncryptionDataMap.alpha

        const hashedSecretCode = await hashSHA256([ ...Buffer.from(boxId, 'utf-8'), ...secretCode ])

        const { decrypted } = await decrypt(encryptedData, commandId, { privateKey, publicKey, hashedSecretCode })

        expect(decrypted instanceof Buffer).to.be.true

        expect(decrypted.length).to.equal(expectedDecryptedData.length)

        for (let index = 0; index < expectedDecryptedData.length; index++) {
            expect(decrypted[index]).to.equal(expectedDecryptedData[index])
        }
    })
}
