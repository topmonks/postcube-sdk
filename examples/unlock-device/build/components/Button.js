import React from "../_snowpack/pkg/react.js";
import cs from "../_snowpack/pkg/classnames.js";
import "./Button.css.proxy.js";
function Button({secondary, children, className, ...pass}) {
  return /* @__PURE__ */ React.createElement("div", {
    className: cs("postcube-button", secondary && "postcube-button--secondary", className)
  }, /* @__PURE__ */ React.createElement("button", {
    ...pass
  }, children));
}
export default Button;
