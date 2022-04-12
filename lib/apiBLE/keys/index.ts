
import { localStorageKeys } from './localStorage'
import { inMemoryKeys } from './inMemory'

export { localStorageKeys, inMemoryKeys }

export interface KeyPair {
    readonly privateKey: Uint8Array
    readonly publicKey: Uint8Array
}

export interface Keys {
    getDeviceKeyIndex(boxId: string): Promise<number|null>
    setDeviceKeyIndex(boxId: string, keyIndex: number): Promise<any>

    getDeviceHashedSecretCode(boxId: string): Promise<Uint8Array|null>
    setDeviceHashedSecretCode(boxId: string, hashedSecretCode: Uint8Array): Promise<any>

    getDeviceKeyPair(): Promise<KeyPair|null>
    setDeviceKeyPair(keyPair: KeyPair): Promise<any>

    hasDeviceBoxKey(keys?: { publicKey: number[] }[]): Promise<boolean>
}
