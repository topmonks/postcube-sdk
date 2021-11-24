
import { jSignal } from 'jsignal'

export interface CubeServices {
    getBattery(): Promise<void>
    syncTime(): Promise<void>
    unlock(): Promise<void>
    setKey(): Promise<void>
    factoryReset(): Promise<void>
}

export interface Cube extends CubeServices {
    readonly onChange: jSignal<Cube>
    readonly name: string
    readonly isConnected: boolean

    connect(): Promise<void>
    disconnect(): Promise<void>
    transaction(exec: () => any): Promise<void>

    read(serviceUUID: string, characteristicUUID: string): Promise<DataView>
    write(serviceUUID: string, characteristicUUID: string, value: DataView): Promise<void>
}

export const DEFAULT_TIMEOUT_CONNECT    = 7000
export const DEFAULT_TIMEOUT_DISCONNECT = 3000
