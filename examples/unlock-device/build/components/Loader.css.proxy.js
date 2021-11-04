// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".loader-component {\n  display: flex;\n  align-items: center;\n  line-height: 24px;\n  color: var(--loader-color);\n}\n\n.loader-component--centered {\n  justify-content: center;\n}\n\n.loader-component__symbol {\n  margin-right: 8px;\n  fill: currentColor;\n  animation: loading 2s infinite;\n}\n\n@keyframes loading {\n  0% {\n    transform: rotate(0deg) scale(0.8);\n  }\n\n  25% {\n    transform: rotate(90deg) scale(0.6);\n  }\n\n  50% {\n    transform: rotate(180deg) scale(0.8);\n  }\n\n  75% {\n    transform: rotate(270deg) scale(0.6);\n  }\n\n  100% {\n    transform: rotate(360deg) scale(0.8);\n  }\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}