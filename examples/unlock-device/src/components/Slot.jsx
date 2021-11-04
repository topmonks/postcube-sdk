import React from "react";
import cs from "classnames";
import "./Slot.css";

const Slot = ({ children, className }) => {
  return <div className={cs("Slot", className)}>{children}</div>;
};

export default Slot;
