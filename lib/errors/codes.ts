
export enum HttpErrorCode {
    unauthorized = 'unauthorized',
    forbidden    = 'forbidden',
    serverError  = 'server_error',
}

export enum BleErrorCode {
    notSupported             = 'not_supported',
    invalidPlatform          = 'invalid_platform',
    bluetoothUnavailable     = 'bluetooth_unavailable',
    bluetoothDisabled        = 'bluetooth_disabled',
    noBoxConnected           = 'no_box_connected',
    invalidName              = 'invalid_device_name',
    unknownBLECharacteristic = 'unknown_ble_characteristic',
    invalidSecretCode        = 'invalid_secret_code',
    invalidKeys              = 'invalid_keys',
}
