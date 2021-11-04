import { isBluetoothAvailable, isBluetoothEnabled, searchForDevice } from "../library/ble-web";

function usePostCubeDevice() {
  return {
    searchForDevice: async (name) => {
      if (!isBluetoothAvailable()) throw new Error("Bluetooth is not available");
      if (!await isBluetoothEnabled()) throw new Error("Bluetooth is not enabled");
      const device = await searchForDevice(name);
      console.log(device);
      return device;
    },
    connectToDevice: async (name) => {
      if (!BluetoothAvailable()) throw new Error("Bluetooth is not available");
      if (!await isBluetoothEnabled()) throw new Error("Bluetooth is not enabled");
    },
    listenToMessages: (device) => {
      return device;
    },
    sendUnlockCommand: (device) => {},
  };
}

export default usePostCubeDevice;
