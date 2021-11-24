
import { jSignal } from 'jsignal'
import { BleClient } from '@capacitor-community/bluetooth-le'

import { boxErrors } from '../errors'
import { Cube } from './cube'
import { CubeCapacitor } from './cube.capacitor'

// export interface ScanOptions {
//     timeout?: number
// }

// export interface ScanResult {
//     promise: Promise<void>
//     cancel(): void
// }

export interface Cubes {
    readonly onChange: jSignal<Cubes>
    readonly isScanning: boolean
    readonly foundCubes: Cube[]

    isAvailable(): Promise<boolean>
    isEnabled(): Promise<boolean>
    // scanForCubes(options?: ScanOptions): Promise<ScanResult>
    requestCube(namePrefix: string): Promise<Cube>
}

let isScanning: boolean = false
let foundCubes: Cube[] = []

const isAvailable = async(): Promise<boolean> => {
    return await BleClient.isEnabled() // TODO: if web check !!navigator.bluetooth
}

const isEnabled = async(): Promise<boolean> => {
    // if (await isAvailable()) {
    //     return navigator.bluetooth.getAvailability()
    // }

    // return false
    return true
}

const ensureEnabled = async() => {
    if (!await isAvailable()) {
        throw boxErrors.bluetoothUnavailable()
    }

    // if (!await isEnabled()) {
    //     throw boxErrors.bluetoothDisabled()
    // }
}

// const scanForCubes = async(options: ScanOptions = {}): Promise<ScanResult> => {
//     await ensureEnabled()

//     let scanTimeout: number
//     let stopScan = false

//     const cancel = () => {
//         if (scanTimeout) {
//             clearTimeout(scanTimeout)
//         }

//         scanTimeout = null
//         stopScan = true
//     }

//     const runScan = async(): Promise<void> => {
//         if (options?.timeout && options.timeout > 0) {
//             scanTimeout = setTimeout(cancel, options.timeout)
//         }

//         while (!stopScan) {
//             console.log('Scanning for cubes...')

//             await new Promise(resolve => setTimeout(resolve, 1000))
//         }
//     }

//     return {
//         promise: runScan(),
//         cancel,
//     }
// }

const requestCube = async(namePrefix: string): Promise<Cube> => {
    await BleClient.initialize()

    const device = await BleClient.requestDevice({
        namePrefix,
    })

    const cube = CubeCapacitor(device)

    return cube
}

export const Cubes: Cubes = {
    onChange: new jSignal(),
    get isScanning(): boolean {
        return isScanning
    },
    isAvailable,
    isEnabled,
    foundCubes,
    // scanForCubes,
    requestCube,
}
