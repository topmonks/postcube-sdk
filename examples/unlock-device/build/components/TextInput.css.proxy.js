// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".postcube-text-input {\r\n  background-color: var(--color-white);\r\n  width: 100%;\r\n  box-sizing: border-box;\r\n  margin: 4px;\r\n}\r\n\r\n.postcube-text-input > span {\r\n  display: block;\r\n  padding-bottom: 5px;\r\n  font-size: 18px;\r\n  line-height: 22px;\r\n  letter-spacing: -0.165px;\r\n}\r\n\r\n.postcube-text-input > input {\r\n  color: var(--color-black);\r\n  font-size: var(--font-size-m);\r\n  font-weight: 400;\r\n  letter-spacing: 0;\r\n  line-height: 44px;\r\n  width: 100%;\r\n  text-align: center;\r\n  white-space: nowrap;\r\n  border: 1px solid #B0B4CC;\r\n  border-radius: 4px;\r\n  background-color: transparent;\r\n  box-sizing: border-box;\r\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}