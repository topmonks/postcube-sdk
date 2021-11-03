import React from "react";
import cs from "classnames";
import "./Button.css";

function Button({ secondary, children, className, disabled, ...pass }) {
  return (
    <div
      className={cs("postcube-button", className, {
        "postcube-button--secondary": secondary,
        "postcube-button--disabled": disabled,
      })}
    >
      <button {...pass}>{children}</button>
    </div>
  );
}

export default Button;
