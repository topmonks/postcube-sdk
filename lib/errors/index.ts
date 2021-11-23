
import { BoxError } from './boxError'

export { BoxError }

export const boxErrors = {
    bluetoothUnavailable: () =>
        new BoxError('bluetooth_unavailable', 'Bluetooth is unavailable'),
    bluetoothDisabled: () =>
        new BoxError('bluetooth_disabled', 'Bluetooth is currently disabled'),
    noBoxConnected: () =>
        new BoxError('no_box_connected', 'No box is currently connected'),
}
