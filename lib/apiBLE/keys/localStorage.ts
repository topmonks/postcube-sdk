
import type { KeyPair, Keys } from './index'

export const LS_DEVICE_PRIVATE_KEY_KEY           = 'device-private-key'
export const LS_DEVICE_PUBLIC_KEY_KEY            = 'device-public-key'
export const LS_DEVICE_KEY_INDEX_PREFIX          = 'device-key-index'
export const LS_DEVICE_HASHED_SECRET_CODE_PREFIX = 'device-hashed-secret-code'

export const localStorageKeys: Keys = {
    async getDeviceKeyIndex(boxId: string) {
        return parseInt(
            window.localStorage.getItem(`${LS_DEVICE_KEY_INDEX_PREFIX}:${boxId}`)
        )
    },
    async setDeviceKeyIndex(boxId: string, keyIndex: number) {
        window.localStorage.setItem(
            `${LS_DEVICE_KEY_INDEX_PREFIX}:${boxId}`,
            keyIndex.toString(),
        )
    },
    async getDeviceHashedSecretCode(boxId: string) {
        const lsHashedSecretCode = window.localStorage.getItem(`${LS_DEVICE_HASHED_SECRET_CODE_PREFIX}:${boxId}`)

        if (/^\s*\[.*\]\s*$/.test(lsHashedSecretCode)) {
            return new Uint8Array(JSON.parse(lsHashedSecretCode))
        }

        return null
    },
    async setDeviceHashedSecretCode(boxId: string, hashedSecretCode: Uint8Array) {
        window.localStorage.setItem(
            `${LS_DEVICE_HASHED_SECRET_CODE_PREFIX}:${boxId}`,
            `[${hashedSecretCode.join(',')}]`,
        )
    },
    async getDeviceKeyPair() {
        const lsPublicKey = window.localStorage.getItem(LS_DEVICE_PUBLIC_KEY_KEY)
        const lsPrivateKey = window.localStorage.getItem(LS_DEVICE_PRIVATE_KEY_KEY)

        let publicKey
        if (/^\s*\[.*\]\s*$/.test(lsPublicKey)) {
            publicKey = new Uint8Array(JSON.parse(lsPublicKey))
        }

        let privateKey
        if (/^\s*\[.*\]\s*$/.test(lsPrivateKey)) {
            privateKey = new Uint8Array(JSON.parse(lsPrivateKey))
        }

        return { publicKey, privateKey }
    },
    async setDeviceKeyPair(keyPair: KeyPair) {
        window.localStorage.setItem(
            LS_DEVICE_PRIVATE_KEY_KEY,
            `[${keyPair.privateKey.join(',')}]`,
        )

        window.localStorage.setItem(
            LS_DEVICE_PUBLIC_KEY_KEY,
            `[${keyPair.publicKey.join(',')}]`,
        )
    },
    async hasDeviceBoxKey(keys = []) {
        const keyPair = await localStorageKeys.getDeviceKeyPair()

        const beginIndex = keyPair.publicKey.length > 64 ? 1 : 0
        const publicKeySignature = `[${keyPair.publicKey.subarray(beginIndex).join(',')}]`

        return keys.findIndex(
            ({ publicKey }) =>
                JSON.stringify(publicKey) === publicKeySignature
        ) > -1
    },
}
