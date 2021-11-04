import {
  SERVICE_UUID,
  SERVICE_UUID_16,
  CHAR_RESULT_UUID,
  CHAR_UNLOCK_UUID,
  BOX_CHAR_RESULTS_INDEX,
  BOX_RESPONSE_MESSAGES,
  BOX_RES_OK,
} from "@topmonks/postcube/ble-box";

export const isBluetoothAvailable = () => navigator.bluetooth !== undefined;
export const isBluetoothEnabled = () => navigator.bluetooth.getAvailability();

export function splitCommand(buf, chunkSize = 20) {
  let offset = 0;
  const length = buf.length;
  const result = [];

  while (offset < length) {
    result.push(buf.subarray(offset, offset + chunkSize));
    offset += chunkSize;
  }

  return result;
}

async function writeToCharacteristic(char, data) {
  const chunks = splitCommand(new Uint8Array(data), 20);

  for (const i in chunks) {
    const chunk = chunks[i];
    await char.writeValue(chunk);
  }
}

export function parseResult(response, charUUID) {
  const buffer = new Uint8Array(response.buffer);
  const index = BOX_CHAR_RESULTS_INDEX[charUUID];
  const result = buffer[index];
  return result;
}

export const resultToMessage = (code) => BOX_RESPONSE_MESSAGES[code] || code;

function usePostCubeDevice() {
  return {
    isDeviceConnected: (device) => {
      return device && device.gatt.connected;
    },

    searchForDevice: async (name) => {
      if (!isBluetoothAvailable()) {
        throw new Error("Bluetooth is not available");
      }
      if (!(await isBluetoothEnabled())) {
        throw new Error("Bluetooth is not enabled");
      }

      const filters = [{ services: [SERVICE_UUID_16], namePrefix: name }];

      return await navigator.bluetooth.requestDevice({
        filters,
        acceptAllDevices: false,
        optionalServices: [SERVICE_UUID, "battery_service"],
      });
    },

    connectToDevice: async (device) => {
      if (!device) {
        throw new Error("No device defined");
      }
      if (!isBluetoothAvailable()) {
        throw new Error("Bluetooth is not available");
      }
      if (!(await isBluetoothEnabled())) {
        throw new Error("Bluetooth is not enabled");
      }

      const { device: connectedDevice } = await device.gatt.connect();

      return connectedDevice;
    },

    disconnectFromDevice: async (device) => {
      if (device) device.gatt.disconnect();
    },

    sendUnlockCommand: async (
      device,
      unlockCommand,
      { timeout = 15000 } = {}
    ) => {
      if (!device) {
        throw new Error("No device defined");
      }
      if (!unlockCommand) {
        throw new Error("No unlockCommand defined");
      }

      const service = await device.gatt.getPrimaryService(SERVICE_UUID);
      await service.getCharacteristics();

      const charToWrite = await service.getCharacteristic(CHAR_UNLOCK_UUID);
      const charToRead = await service.getCharacteristic(CHAR_RESULT_UUID);

      await charToRead.startNotifications();

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("timeout"));
        }, timeout);

        const handler = ({ target: { value } }) => {
          clearTimeout(timer);
          const result = parseResult(value, charUUID);
          if (result !== BOX_RES_OK) reject(resultToMessage(result));
          resolve(device);
        };
        charToRead.addEventListener("characteristicvaluechanged", handler);

        writeToCharacteristic(charToWrite, unlockCommand).catch(reject);
      });
    },

    readBattery: async (device) => {
      const service = await device.gatt.getPrimaryService("battery_service");
      const char = await service.getCharacteristic("battery_level");
      const value = await char.readValue();
      const level = value.getUint8(0);
      return level;
    },
  };
}

export default usePostCubeDevice;
