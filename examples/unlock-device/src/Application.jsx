import React, { useCallback, useState } from "react";
import Button from "./components/Button";
import TextInput from "./components/TextInput";
import usePostCubeDevice from "./hooks/usePostCubeDevice";
import "./Application.css";
import Header from "./components/Header";
import Loader from "./components/Loader";
import Slot from "./components/Slot";

const validate = ({ unlockStringCommand, deviceName }) =>
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
  const [formValues, setFormValues] = useState({
    deviceName: "PostCube ",
    unlockStringCommand: "",
    device: null,
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
    listenToMessages,
    sendUnlockCommand,
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
      searchForDevice(formValues.deviceName)
        .then((device) => {
          setFormValues({ ...formValues, device, deviceName: device?.name });
        })
        .catch(handleError);
    },
    [formValues]
  );

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!formValues?.device) return handleError(new Error("Device not found"));
    connectToDevice(formValues?.device)
      .then(listenToMessages)
      .then(sendUnlockCommand)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  return (
    <>
      <Header logoLink="https://sdk.postcube.cz/examples/unlock-device/build/" />
      <form className="application" onSubmit={handleSubmit}>
        <h1>Unlock Device</h1>
        <div className="mb8">
          <TextInput
            label="Device name"
            value={formValues.deviceName}
            name="deviceName"
            onChange={updateFormValues}
          />
        </div>

        <Slot className="mb8">
          <div className="mb8">
            {formValues.device ? (
              <>{formValues.device.name} connected</>
            ) : (
              "No device yet"
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
        <Button className="m16" disabled={!validate(formValues)} type="submit">
          {false ? <Loader text="Otevírám .." centered /> : "Unlock"}
        </Button>
      </form>
    </>
  );
}

export default Application;
