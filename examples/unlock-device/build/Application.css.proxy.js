// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".application {\r\n  position: absolute;\r\n  inset: 0;\r\n}\r\n\r\n.application h1 {\r\n  text-align: center;\r\n}\r\n\r\n.application form {\r\n  height: 100%;\r\n  margin: 0 auto;\r\n  width: 300px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  justify-content: center;\r\n  align-items: center;\r\n}\r\n\r\n.application form > * {\r\n  width: 100%;\r\n}\r\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}