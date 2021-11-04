/**
 * Pack of functions for highlevel communication with (PostCube)BLE device.
 */
import { SERVICE_UUID, SERVICE_UUID_16 } from "../snowpack/pkg/@topmonks/postcube/ble-box.js";

export function isBluetoothAvailable() {
  return navigator.bluetooth !== undefined;
}

export async function isBluetoothEnabled() {
  return (await navigator.bluetooth.getAvailability()) === true;
}

export async function searchForDevice(name) {
  if (!name) throw new Error("name is required");
  const filters = [{ services: [SERVICE_UUID_16], namePrefix: name }];

  return await navigator.bluetooth.requestDevice({
    filters,
    acceptAllDevices: false,
    optionalServices: [SERVICE_UUID, "battery_service"],
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
