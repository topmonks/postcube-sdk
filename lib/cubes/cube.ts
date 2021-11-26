
import { jSignal } from 'jsignal'

export interface CubeCommands {
    getBattery(): Promise<number>
    syncTime(timestamp: number): Promise<void>
    unlock(lockId: number): Promise<void>
    setKey(keyIndex: number, publicKey: Buffer, expireAt: number): Promise<void>
    factoryReset(): Promise<void>
}

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
