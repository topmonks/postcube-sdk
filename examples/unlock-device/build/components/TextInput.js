import React from "../_snowpack/pkg/react.js";
import cs from "../_snowpack/pkg/classnames.js";
import "./TextInput.css.proxy.js";
function TextInput({secondary, label, className, ...pass}) {
  return /* @__PURE__ */ React.createElement("label", {
    className: cs("postcube-text-input", className)
  }, /* @__PURE__ */ React.createElement("span", null, label), /* @__PURE__ */ React.createElement("input", {
    ...pass
  }));
}
export default TextInput;
