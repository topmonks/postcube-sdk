
import { expect } from 'chai'

import {
    BleErrorCode,
    HttpErrorCode,
    bleErrors,
    httpErrors,
} from '../lib/errors'

describe('errors tests', () => {
    it('should have correct corresponding BleErrorCode', async() => {
        const unknownError = bleErrors.unknownError('Unknown Error')
        const notSupportedError = bleErrors.notSupported('Not Supported')
        const invalidPlatformError = bleErrors.invalidPlatform()
        const bluetoothUnavailableError = bleErrors.bluetoothUnavailable()
        const bluetoothDisabledError = bleErrors.bluetoothDisabled()
        const noBoxConnectedError = bleErrors.noBoxConnected()
        const invalidNameError = bleErrors.invalidName()
        const unknownBLEServiceError = bleErrors.unknownBLEService()
        const unknownBLECharacteristicError = bleErrors.unknownBLECharacteristic()
        const invalidSecretCodeError = bleErrors.invalidSecretCode()
        const invalidKeysError = bleErrors.invalidKeys()
        const invalidCommandError = bleErrors.invalidCommand()
        const invalidCommandTooLargeError = bleErrors.invalidCommandTooLarge()
        const invalidAuthenticationError = bleErrors.invalidAuthentication()
        const timeoutError = bleErrors.timeout('Timeout')

        expect(unknownError.name).to.equal(BleErrorCode.unknownError)
        expect(notSupportedError.name).to.equal(BleErrorCode.notSupported)
        expect(invalidPlatformError.name).to.equal(BleErrorCode.invalidPlatform)
        expect(bluetoothUnavailableError.name).to.equal(BleErrorCode.bluetoothUnavailable)
        expect(bluetoothDisabledError.name).to.equal(BleErrorCode.bluetoothDisabled)
        expect(noBoxConnectedError.name).to.equal(BleErrorCode.noBoxConnected)
        expect(invalidNameError.name).to.equal(BleErrorCode.invalidName)
        expect(unknownBLEServiceError.name).to.equal(BleErrorCode.unknownBLEService)
        expect(unknownBLECharacteristicError.name).to.equal(BleErrorCode.unknownBLECharacteristic)
        expect(invalidSecretCodeError.name).to.equal(BleErrorCode.invalidSecretCode)
        expect(invalidKeysError.name).to.equal(BleErrorCode.invalidKeys)
        expect(invalidCommandError.name).to.equal(BleErrorCode.invalidCommand)
        expect(invalidCommandTooLargeError.name).to.equal(BleErrorCode.invalidCommandTooLarge)
        expect(invalidAuthenticationError.name).to.equal(BleErrorCode.invalidAuthentication)
        expect(timeoutError.name).to.equal(BleErrorCode.timeout)
    })

    it('should have correct corresponding HttpErrorCode', async() => {
        const unauthorizedError = httpErrors.unauthorized()
        const forbiddenError = httpErrors.forbidden()
        const serverErrorError = httpErrors.serverError()

        expect(unauthorizedError.name).to.equal(HttpErrorCode.unauthorized)
        expect(forbiddenError.name).to.equal(HttpErrorCode.forbidden)
        expect(serverErrorError.name).to.equal(HttpErrorCode.serverError)
    })
})
