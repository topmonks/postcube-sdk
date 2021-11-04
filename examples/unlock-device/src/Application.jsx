import React, { useCallback, useState } from "react";
import Button from "./components/Button";
import TextInput from "./components/TextInput";
import usePostCubeDevice from "./hooks/usePostCubeDevice";
import "./Application.css";
import Header from "./components/Header";
import Loader from "./components/Loader";

const validate = ({ unlockStringCommand }) => Boolean(unlockStringCommand);

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
    deviceId: "",
    unlockStringCommand: "",
  });
  const device = usePostCubeDevice();
  const updateFormValues = useCallback(({ target: { name, value } }) => {
    setFormValues({ ...formValues, [name]: value });
  }, [formValues]);

  const handleSearchForDevice = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!device) return console.error("No PostCube device");
    // ..
  }, []);

  return (
    <>
      <Header logoLink="https://sdk.postcube.cz/examples/unlock-device/build/" />
      <form className="application" onSubmit={handleSubmit}>
        <h1>Unlock Device</h1>
        <div className="mb8">
          <TextInput
            label="Device ID"
            value={formValues.deviceId}
            name="deviceId"
            onChange={updateFormValues}
          />
        </div>
        <div
          className="mb8"
          style={{
            textAlign: "center",
            padding: 16,
            boxSizing: "border-box",
            border: "1px solid var(--color-grey)",
          }}
        >
          <div>jakožeslot</div>
          <a href="#" onClick={handleSearchForDevice}>
            Vyhledat zařízení v okolí
          </a>
        </div>
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
