
import { HttpError } from './httpError'
import { BleError } from './bleError'
import { HttpErrorCode, BleErrorCode } from './codes'

export {
    HttpError,
    BleError,
    HttpErrorCode,
    BleErrorCode,
}

export const httpErrors = {
    unauthorized: (message: string = 'Unauthorized') =>
        new HttpError(HttpErrorCode.unauthorized, message),

    forbidden: (message: string = 'Forbidden') =>
        new HttpError(HttpErrorCode.forbidden, message),

    serverError: (message: string = 'Server error') =>
        new HttpError(HttpErrorCode.serverError, message),
}

export const bleErrors = {
    unknownError: (message: string) =>
        new BleError(BleErrorCode.unknownError, message),

    notSupported: (message: string) =>
        new BleError(BleErrorCode.notSupported, message),

    invalidPlatform: (message: string = 'Invalid platform') =>
        new BleError(BleErrorCode.invalidPlatform, message),

    bluetoothUnavailable: () =>
        new BleError(BleErrorCode.bluetoothUnavailable, 'Bluetooth is unavailable'),

    bluetoothDisabled: () =>
        new BleError(BleErrorCode.bluetoothDisabled, 'Bluetooth is currently disabled'),

    noBoxConnected: () =>
        new BleError(BleErrorCode.noBoxConnected, 'No box is currently connected'),

    invalidName: (message: string = 'Invalid PostCube device name') =>
        new BleError(BleErrorCode.invalidName, message),

    unknownBLEService: (message: string = 'Unknown bluetooth service') =>
        new BleError(BleErrorCode.unknownBLEService, message),

    unknownBLECharacteristic: (message: string = 'Unknown bluetooth characteristic') =>
        new BleError(BleErrorCode.unknownBLECharacteristic, message),

    invalidSecretCode: (message: string = 'Invalid secret code') =>
        new BleError(BleErrorCode.invalidSecretCode, message),

    invalidKeys: (message: string = 'Invalid encryption keys') =>
        new BleError(BleErrorCode.invalidKeys, message),

    invalidCommand: (message: string = 'Invalid PostCube BLE command') =>
        new BleError(BleErrorCode.invalidCommand, message),
}
