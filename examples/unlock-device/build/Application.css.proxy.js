// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".application {\n  position: absolute;\n  inset: 0;\n}\n\n.application h1 {\n  text-align: center;\n}\n\n.application form {\n  height: 100%;\n  margin: 0 auto;\n  width: 300px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n\n.application form > * {\n  width: 100%;\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}