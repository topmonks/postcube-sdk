/**
 * Pack of functions for highlevel communication with (PostCube)BLE device.
 */

 export function isBluetoothAvailable() {
   return navigator.bluetooth !== undefined;
 }

 export async function isBluetoothEnabled() {
   return await navigator.bluetooth.getAvailability() === true;
 }

 export async function searchForDevice(name) {
   if (!name) throw new Error('name is required');
   const filters = [{ services: [SERVICE_UUID_16], namePrefix: name }];

    const bleDevice = await navigator.bluetooth.requestDevice({
      filters,
      acceptAllDevices: false,
      optionalServices: [SERVICE_UUID, "battery_service"],
    });
    return BleAdapter(bleDevice);

   return navigator.bluetooth.requestDevice({
     filters: [{
       services: ['0xffe0']
     }]
   });
 }

 export function connectToDevice(device) {
   return device.gatt.connect();
 }

 export function disconnectFromDevice(device) {
   return device.gatt.disconnect();
 }

export function getCharacteristic(service, characteristic) {
  return service.getCharacteristic(characteristic);
}

  export function writeCharacteristic(characteristic, value) {
    return characteristic.writeValue(value);
  }