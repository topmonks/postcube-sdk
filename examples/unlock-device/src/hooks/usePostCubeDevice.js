import {
  isBluetoothAvailable,
  isBluetoothEnabled,
  searchForDevice,
  connectToDevice,
  isDeviceConnected,
} from "../library/ble-web";

function usePostCubeDevice() {
  return {
    isDeviceConnected,

    searchForDevice: async (name) => {
      if (!isBluetoothAvailable())
        throw new Error("Bluetooth is not available");
      if (!(await isBluetoothEnabled()))
        throw new Error("Bluetooth is not enabled");
      const device = await searchForDevice(name);
      return device;
    },
    connectToDevice: async (device) => {
      if (!isBluetoothAvailable())
        throw new Error("Bluetooth is not available");
      if (!(await isBluetoothEnabled()))
        throw new Error("Bluetooth is not enabled");

      const { device: connectedDevice } = await connectToDevice(device);

      return connectedDevice;
    },
    listenToMessages: (device) => {
      throw new Error("Not yet implemented");
      return device;
    },
    sendUnlockCommand: (device) => {},
  };
}

export default usePostCubeDevice;
