import React, { useCallback, useState } from "react";
import Button from "./components/Button";
import TextInput from "./components/TextInput";
import usePostCubeDevice from "./hooks/usePostCubeDevice";
import "./Application.css";
import Header from "./components/Header";
import Loader from "./components/Loader";
import Slot from "./components/Slot";

const validate = ({ unlockStringCommand, deviceFilter: deviceName }) =>
  Boolean(unlockStringCommand) &&
  unlockStringCommand.length > 42 &&
  Boolean(deviceName) &&
  "PostCube ".length + deviceName.length >= 6;

/**
 * Single screen application.
 * Purpose: Unlock device.
 * Procedure:
 *  1. Enter unlock string.
 *  2. Convert unlock string to command.
 *  3. Find and connect to the device near by
 *  4. Send command to the device.
 *  5. Wait for the device to unlock.
 *  6. Show unlock response message.
 * @returns
 */
function Application() {
  const [foundDevice, setFoundDevice] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [formValues, setFormValues] = useState({
    deviceFilter: "PostCube ",
    unlockStringCommand: "",
  });

  const updateFormValues = useCallback(
    ({ target: { name, value } }) => {
      setFormValues({ ...formValues, [name]: value });
    },
    [formValues]
  );

  const {
    searchForDevice,
    connectToDevice,
    sendUnlockCommand,
    isDeviceConnected,
    disconnectFromDevice,
  } = usePostCubeDevice();

  const handleSuccess = () => {
    alert("Device unlocked successfully!");
  };

  const handleError = (error) => {
    console.trace(error);
    alert(`Error occurred: ${error.toString()}`);
  };

  const handleSearchForDevice = useCallback(
    (event) => {
      event.preventDefault();
      searchForDevice(formValues.deviceFilter)
        .then(setFoundDevice)
        .catch(handleError);
    },
    [formValues]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (!foundDevice) return handleError(new Error("Device not found"));
      setUnlocking(true);

      connectToDevice(foundDevice)
        .then((device) => {
          setFoundDevice(device);
          return device;
        })
        .then((device) => {
          const command = "fok"; // TODO decode: formValues.unlockStringCommand
          return sendUnlockCommand(device, command);
        })
        .then((device) => disconnectFromDevice(device))
        .catch(handleError)
        .finally(() => {
          setUnlocking(false);
        });
    },
    [formValues]
  );

  return (
    <>
      <Header logoLink="https://sdk.postcube.cz/examples/unlock-device/build/" />
      <form className="application" onSubmit={handleSubmit}>
        <h1>Unlock Device</h1>
        <div className="mb8">
          <TextInput
            label="Device filter"
            value={formValues.deviceFilter}
            name="deviceFilter"
            onChange={updateFormValues}
          />
        </div>

        <Slot className="mb8">
          <div className="mb8">
            {foundDevice && (
              <>
                {foundDevice.name}{" "}
                {isDeviceConnected(foundDevice) ? "připojen" : "nalezen"}
              </>
            )}
          </div>

          <a href="#" onClick={handleSearchForDevice}>
            Vyhledat zařízení v okolí
          </a>
        </Slot>
        <div className="mb16">
          <TextInput
            label="Unlock Command"
            value={formValues.unlockStringCommand}
            name="unlockStringCommand"
            onChange={updateFormValues}
          />
        </div>
        <Button
          className="m16"
          disabled={!validate(formValues) || unlocking}
          type="submit"
        >
          {false ? <Loader text="Otevírám .." centered /> : "Unlock"}
        </Button>
      </form>
    </>
  );
}

export default Application;
