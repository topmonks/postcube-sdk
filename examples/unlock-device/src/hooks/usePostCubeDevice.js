import { isBluetoothAvailable, isBluetoothEnabled } from "../library/ble-web";

function usePostCubeDevice() {
  return {
    searchForDevice: async () => {
      if (!isBluetoothAvailable()) throw new Error("Bluetooth is not available");
      if (!await isBluetoothEnabled()) throw new Error("Bluetooth is not enabled");
      throw new Error("Not implemented");
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
