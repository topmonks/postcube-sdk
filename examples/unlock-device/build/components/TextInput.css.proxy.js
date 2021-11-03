// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".postcube-text-input {\n  background-color: var(--color-white);\n  border-radius: 8px;\n  width: 100%;\n  box-sizing: border-box;\n  margin: 4px;\n}\n\n.postcube-text-input > span {\n  display: block;\n  padding-bottom: 4px;\n}\n\n.postcube-text-input > input {\n  color: var(--color-black);\n  font-size: var(--font-size-m);\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 44px;\n  width: 100%;\n  text-align: center;\n  white-space: nowrap;\n  border: 1px solid #B0B4CC;\n  border-radius: 4px;\n  background-color: transparent;\n\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}