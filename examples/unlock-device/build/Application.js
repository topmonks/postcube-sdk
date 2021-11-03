import React, {useCallback, useState} from "./snowpack/pkg/react.js";
import Button from "./components/Button.js";
import TextInput from "./components/TextInput.js";
import usePostCubeDevice from "./hooks/usePostCubeDevice.js";
import "./Application.css.proxy.js";
import Header from "./components/Header.js";
import Loader from "./components/Loader.js";
const validate = (unlockStringCommand) => Boolean(unlockStringCommand);
function Application() {
  const [unlockStringCommand, setUnlockStringCommand] = useState("");
  const handleUnlockStringCommandChange = useCallback(({target: {value}}) => {
    setUnlockStringCommand(value);
  }, []);
  const device = usePostCubeDevice();
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!device)
      return console.error("No PostCube device");
  }, []);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Header, {
    logoLink: "https://sdk.postcube.cz/examples/unlock-device/build/"
  }), /* @__PURE__ */ React.createElement("form", {
    className: "application",
    onSubmit: handleSubmit
  }, /* @__PURE__ */ React.createElement("h1", null, "Unlock Device"), /* @__PURE__ */ React.createElement("div", {
    className: "mb16"
  }, /* @__PURE__ */ React.createElement(TextInput, {
    label: "Enter the Command",
    value: unlockStringCommand,
    onChange: handleUnlockStringCommandChange
  })), /* @__PURE__ */ React.createElement(Button, {
    className: "m16",
    disabled: !validate(unlockStringCommand),
    type: "submit"
  }, false ? /* @__PURE__ */ React.createElement(Loader, {
    text: "Otevírám ..",
    centered: true
  }) : "Unlock"), /* @__PURE__ */ React.createElement(Button, {
    className: "m16",
    secondary: true,
    name: "paste-and-unlock",
    type: "submit"
  }, "Paste & Unlock")));
}
export default Application;
