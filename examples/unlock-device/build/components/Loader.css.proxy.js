// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".loader-component {\r\n  display: flex;\r\n  align-items: center;\r\n  line-height: 24px;\r\n  color: var(--loader-color);\r\n}\r\n\r\n.loader-component--centered {\r\n  justify-content: center;\r\n}\r\n\r\n.loader-component__symbol {\r\n  margin-right: 8px;\r\n  fill: currentColor;\r\n  animation: loading 2s infinite;\r\n}\r\n\r\n@keyframes loading {\r\n  0% {\r\n    transform: rotate(0deg) scale(0.8);\r\n  }\r\n\r\n  25% {\r\n    transform: rotate(90deg) scale(0.6);\r\n  }\r\n\r\n  50% {\r\n    transform: rotate(180deg) scale(0.8);\r\n  }\r\n\r\n  75% {\r\n    transform: rotate(270deg) scale(0.6);\r\n  }\r\n\r\n  100% {\r\n    transform: rotate(360deg) scale(0.8);\r\n  }\r\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}