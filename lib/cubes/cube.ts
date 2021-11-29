
import { jSignal, Listener } from 'jsignal'

import { EncodingEncryptionKeys } from '../encoding'

export interface CubeCommands {
    setEncryptionKeys(keys: EncodingEncryptionKeys): void

    readBattery(): Promise<number>

    writeSyncTime(timestamp: number): Promise<void>
    writeUnlock(lockId: number): Promise<number>
    writeUnlockWithCustomCommand(command: Uint8Array): Promise<number>
    writeSetKey(keyIndex: number, publicKey: Uint8Array, expireAt: number): Promise<void>
    writeFactoryReset(): Promise<void>
}

export type StopNotifications = () => void

export interface Cube extends CubeCommands {
    readonly onChange: jSignal<Cube>
    readonly id: string
    readonly name: string
    readonly deviceId: string
    readonly isConnected: boolean
    readonly isMultibox: boolean

    connect(): Promise<void>
    disconnect(): Promise<void>
    getRSSI(): Promise<number>

    read(serviceUUID: string, characteristicUUID: string): Promise<DataView>
    write(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void>

    listenForNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<DataView>,
    ): Promise<StopNotifications>
}

export interface ScanOptions {
    namePrefix?: string
    services?: string[]
    timeout?: number
    onDiscovery?(cube: Cube): any
}

export interface ScanResult {
    promise: Promise<void>
    stopScan(): void
}

export const DEFAULT_TIMEOUT_CONNECT    = 7000
export const DEFAULT_TIMEOUT_DISCONNECT = 3000
