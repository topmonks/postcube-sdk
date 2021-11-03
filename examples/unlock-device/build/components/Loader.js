import React from "../snowpack/pkg/react.js";
import cs from "../snowpack/pkg/classnames.js";
import "./Loader.css.proxy.js";
export default function Loader({className, text, centered}) {
  return /* @__PURE__ */ React.createElement("div", {
    className: cs(className, "loader-component delayed-visibility", {
      "loader-component--centered": centered
    })
  }, /* @__PURE__ */ React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    "xml:space": "preserve",
    width: 24,
    className: "loader-component__symbol"
  }, /* @__PURE__ */ React.createElement("path", {
    d: "M0 0v16l8 8h16V8l-8-8z"
  })), text || "Načítám...");
}
