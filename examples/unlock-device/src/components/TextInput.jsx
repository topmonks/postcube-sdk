import React from "react";
import cs from "classnames";
import "./TextInput.css";

function TextInput({ secondary, label,  className, ...pass }) {
  return (
    <label
      className={cs(
        "postcube-text-input",
        // secondary && "postcube-text-input",
        className
      )}
    >
      <span>{label}</span>
      <input {...pass} />
    </label>
  );
}

export default TextInput;
