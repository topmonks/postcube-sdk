// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".Slot {\n    background: #F6F6FB;\n    box-shadow: inset 0px 4px 4px rgba(131, 136, 170, 0.08);\n    border-radius: 8px;\n    min-height: 77px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    flex-direction: column;\n\n    font-size: 16px;\n    line-height: 19px;\n    letter-spacing: -0.165px;\n    color: #7884A1;\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}