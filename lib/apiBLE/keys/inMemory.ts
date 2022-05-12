
import type { KeyPair, Keys } from './index'

export const LS_DEVICE_PRIVATE_KEY_KEY  = 'device-private-key'
export const LS_DEVICE_PUBLIC_KEY_KEY   = 'device-public-key'
export const LS_DEVICE_KEY_INDEX_PREFIX = 'device-key-index'

const deviceKeyIndexes: { [boxId: string]: number } = {}
const deviceHashedSecretCodes: { [boxId: string]: Uint8Array } = {}
let deviceKeyPair: KeyPair = null
let deviceKeyLabel = null

export const inMemoryKeys: Keys = {
    async getDeviceKeyIndex(boxId: string): Promise<number|null> {
        if (typeof deviceKeyIndexes[boxId] === 'number') {
            return deviceKeyIndexes[boxId]
        }

        return null
    },
    async setDeviceKeyIndex(boxId: string, keyIndex: number) {
        deviceKeyIndexes[boxId] = keyIndex
    },
    async getDeviceKeyLabel() {
        return deviceKeyLabel
    },
    async setDeviceKeyLabel(value: string) {
        deviceKeyLabel = value
    },
    async getDeviceHashedSecretCode(boxId: string) {
        if (deviceHashedSecretCodes[boxId]) {
            return deviceHashedSecretCodes[boxId]
        }

        return null
    },
    async setDeviceHashedSecretCode(boxId: string, hashedSecretCode: Uint8Array) {
        deviceHashedSecretCodes[boxId] = hashedSecretCode
    },
    async getDeviceKeyPair(): Promise<KeyPair|null> {
        if (!deviceKeyPair?.privateKey && !deviceKeyPair?.publicKey) {
            return null
        }

        return deviceKeyPair
    },
    async setDeviceKeyPair(keyPair: KeyPair) {
        deviceKeyPair = keyPair
    },
    async hasDeviceBoxKey(keys = []) {
        const keyPair = await inMemoryKeys.getDeviceKeyPair()

        const beginIndex = keyPair.publicKey.length > 64 ? 1 : 0
        const publicKeySignature = `[${keyPair.publicKey.subarray(beginIndex).join(',')}]`

        return keys.findIndex(
            ({ publicKey }) =>
                JSON.stringify(publicKey) === publicKeySignature
        ) > -1
    },
}
