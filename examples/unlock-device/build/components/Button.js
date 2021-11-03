import React from "../snowpack/pkg/react.js";
import cs from "../snowpack/pkg/classnames.js";
import "./Button.css.proxy.js";
function Button({secondary, children, className, disabled, ...pass}) {
  return /* @__PURE__ */ React.createElement("div", {
    className: cs("postcube-button", className, {
      "postcube-button--secondary": secondary,
      "postcube-button--disabled": disabled
    })
  }, /* @__PURE__ */ React.createElement("button", {
    ...pass
  }, children));
}
export default Button;
