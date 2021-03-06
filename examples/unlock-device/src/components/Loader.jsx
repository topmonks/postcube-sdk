import React from "react";
import cs from "classnames";
import "./Loader.css";

export default function Loader({ className, text, centered }) {
  return (
    <div
      className={cs(className, "loader-component delayed-visibility", {
        "loader-component--centered": centered,
      })}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        xml:space="preserve"
        width={24}
        className="loader-component__symbol"
      >
        <path d="M0 0v16l8 8h16V8l-8-8z" />
      </svg>
      {text || "Načítám..."}
    </div>
  );
}
