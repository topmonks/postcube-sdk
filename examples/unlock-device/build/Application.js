import React, {useCallback, useState} from "./snowpack/pkg/react.js";
import Button from "./components/Button.js";
import TextInput from "./components/TextInput.js";
import usePostCubeDevice from "./hooks/usePostCubeDevice.js";
import "./Application.css.proxy.js";
import Header from "./components/Header.js";
import Loader from "./components/Loader.js";
import Slot from "./components/Slot.js";
const validate = ({unlockStringCommand, deviceFilter: deviceName}) => Boolean(unlockStringCommand) && unlockStringCommand.length > 42 && Boolean(deviceName) && "PostCube ".length + deviceName.length >= 6;
function Application() {
  const [foundDevice, setFoundDevice] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [formValues, setFormValues] = useState({
    deviceFilter: "PostCube ",
    unlockStringCommand: ""
  });
  const updateFormValues = useCallback(({target: {name, value}}) => {
    setFormValues({...formValues, [name]: value});
  }, [formValues]);
  const {
    searchForDevice,
    connectToDevice,
    sendUnlockCommand,
    isDeviceConnected,
    disconnectFromDevice
  } = usePostCubeDevice();
  const handleSuccess = () => {
    alert("Device unlocked successfully!");
  };
  const handleError = (error) => {
    console.trace(error);
    alert(`Error occurred: ${error.toString()}`);
  };
  const handleSearchForDevice = useCallback((event) => {
    event.preventDefault();
    searchForDevice(formValues.deviceFilter).then(setFoundDevice).catch(handleError);
  }, [formValues]);
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!foundDevice)
      return handleError(new Error("Device not found"));
    setUnlocking(true);
    connectToDevice(foundDevice).then((device) => {
      setFoundDevice(device);
      return device;
    }).then((device) => {
      const command = "fok";
      return sendUnlockCommand(device, command);
    }).then((device) => disconnectFromDevice(device)).catch(handleError).finally(() => {
      setUnlocking(false);
    });
  }, [formValues]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Header, {
    logoLink: "https://sdk.postcube.cz/examples/unlock-device/build/"
  }), /* @__PURE__ */ React.createElement("form", {
    className: "application",
    onSubmit: handleSubmit
  }, /* @__PURE__ */ React.createElement("h1", null, "Unlock Device"), /* @__PURE__ */ React.createElement("div", {
    className: "mb8"
  }, /* @__PURE__ */ React.createElement(TextInput, {
    label: "Device filter",
    value: formValues.deviceFilter,
    name: "deviceFilter",
    onChange: updateFormValues
  })), /* @__PURE__ */ React.createElement(Slot, {
    className: "mb8"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "mb8"
  }, foundDevice && /* @__PURE__ */ React.createElement(React.Fragment, null, foundDevice.name, " ", isDeviceConnected(foundDevice) ? "připojen" : "nalezen")), /* @__PURE__ */ React.createElement("a", {
    href: "#",
    onClick: handleSearchForDevice
  }, "Vyhledat zařízení v okolí")), /* @__PURE__ */ React.createElement("div", {
    className: "mb16"
  }, /* @__PURE__ */ React.createElement(TextInput, {
    label: "Unlock Command",
    value: formValues.unlockStringCommand,
    name: "unlockStringCommand",
    onChange: updateFormValues
  })), /* @__PURE__ */ React.createElement(Button, {
    className: "m16",
    disabled: !validate(formValues) || unlocking,
    type: "submit"
  }, false ? /* @__PURE__ */ React.createElement(Loader, {
    text: "Otevírám ..",
    centered: true
  }) : "Unlock")));
}
export default Application;
