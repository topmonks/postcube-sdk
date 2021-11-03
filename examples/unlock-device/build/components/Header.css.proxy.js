// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".Header {\r\n    background-color: var(--color-primary);\r\n    padding: 16px 24px;\r\n    padding-top: calc(env(safe-area-inset-top) + 24px);\r\n}\r\n\r\n.Header svg {\r\n    fill: var(--color-white);\r\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}