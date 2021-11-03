import React from "react";
import cs from "classnames";
import "./Button.css";

function Button({ secondary, children, className, ...pass }) {
  return (
    <div
      className={cs(
        "postcube-button",
        secondary && "postcube-button--secondary",
        className
      )}
    >
      <button {...pass}>{children}</button>
    </div>
  );
}

export default Button;
