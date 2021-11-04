import React, {useCallback, useState} from "./snowpack/pkg/react.js";
import Button from "./components/Button.js";
import TextInput from "./components/TextInput.js";
import usePostCubeDevice from "./hooks/usePostCubeDevice.js";
import "./Application.css.proxy.js";
import Header from "./components/Header.js";
import Loader from "./components/Loader.js";
import Slot from "./components/Slot.js";
const validate = ({unlockStringCommand, deviceId}) => Boolean(unlockStringCommand) && unlockStringCommand.length > 42 && Boolean(deviceId) && deviceId.length >= 6;
function Application() {
  const [formValues, setFormValues] = useState({
    deviceId: "",
    unlockStringCommand: "",
    device: null
  });
  const updateFormValues = useCallback(({target: {name, value}}) => {
    setFormValues({...formValues, [name]: value});
  }, [formValues]);
  const {
    searchForDevice,
    connectToDevice,
    listenToMessages,
    sendUnlockCommand
  } = usePostCubeDevice();
  const handleSuccess = () => {
    alert("Device unlocked successfully!");
  };
  const handleError = (error) => {
    alert(`Error occurred: ${error.toString()}`);
  };
  const handleSearchForDevice = useCallback((event) => {
    event.preventDefault();
    searchForDevice(`PostCube ${formValues.deviceId}`).then(updateFormValues).catch(handleError);
  }, [formValues]);
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!formValues?.device)
      return handleError(new Error("Device not found"));
    connectToDevice(formValues?.device).then(listenToMessages).then(sendUnlockCommand).then(handleSuccess).catch(handleError);
  }, []);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Header, {
    logoLink: "https://sdk.postcube.cz/examples/unlock-device/build/"
  }), /* @__PURE__ */ React.createElement("form", {
    className: "application",
    onSubmit: handleSubmit
  }, /* @__PURE__ */ React.createElement("h1", null, "Unlock Device"), /* @__PURE__ */ React.createElement("div", {
    className: "mb8"
  }, /* @__PURE__ */ React.createElement(TextInput, {
    label: "Device ID",
    value: formValues.deviceId,
    name: "deviceId",
    onChange: updateFormValues
  })), /* @__PURE__ */ React.createElement(Slot, {
    className: "mb8"
  }, formValues.device ? /* @__PURE__ */ React.createElement("div", null, formValues.device.name) : /* @__PURE__ */ React.createElement("a", {
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
    disabled: !validate(formValues),
    type: "submit"
  }, false ? /* @__PURE__ */ React.createElement(Loader, {
    text: "Otevírám ..",
    centered: true
  }) : "Unlock")));
}
export default Application;
