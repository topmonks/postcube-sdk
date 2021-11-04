import React from "../snowpack/pkg/react.js";
import cs from "../snowpack/pkg/classnames.js";
import "./Slot.css.proxy.js";
const Slot = ({children, className}) => {
  return /* @__PURE__ */ React.createElement("div", {
    className: cs("Slot", className)
  }, children);
};
export default Slot;
