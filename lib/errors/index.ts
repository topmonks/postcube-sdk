
import { CubeError } from './cubeError'

export { CubeError }

export const cubeErrors = {
    notSupported: (message: string) =>
        new CubeError('not_supported', message),
    invalidPlatform: (message: string = 'Invalid platform') =>
        new CubeError('invalid_platform', message),
    bluetoothUnavailable: () =>
        new CubeError('bluetooth_unavailable', 'Bluetooth is unavailable'),
    bluetoothDisabled: () =>
        new CubeError('bluetooth_disabled', 'Bluetooth is currently disabled'),
    noBoxConnected: () =>
        new CubeError('no_box_connected', 'No box is currently connected'),
    invalidName: (message: string = 'Invalid PostCube device name') =>
        new CubeError('invalid_device_name', message),
    unknownBLECharacteristic: (message: string = 'Unknown bluetooth characteristic') =>
        new CubeError('unknown_ble_characteristic', message),
}
