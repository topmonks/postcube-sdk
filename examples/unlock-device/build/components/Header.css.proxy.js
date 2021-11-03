// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".Header {\n    background-color: var(--color-primary);\n    padding: 16px 24px;\n    padding-top: calc(env(safe-area-inset-top) + 24px);\n}\n\n.Header svg {\n    fill: var(--color-white);\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}