// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".postcube-button {\r\n  color: var(--color-white);\r\n  background-color: var(--color-primary);\r\n  border-radius: 4px;\r\n  box-shadow: 0px 5px 20px #E5E8EE;\r\n  display: flex;\r\n  align-items: center;\r\n  height: 44px;\r\n  width: 100%;\r\n  margin: 4px;\r\n  box-sizing: border-box;\r\n}\r\n\r\n.postcube-button.postcube-button--secondary {\r\n  background-color: var(--color-secondary);\r\n  border: 2px solid var(--color-primary);\r\n}\r\n\r\n.postcube-button.postcube-button--disabled {\r\n  color: var(--color-silver);\r\n  background-color: var(--color-grey);\r\n  --loader-color: var(--color-silver);\r\n}\r\n\r\n.postcube-button.postcube-button--disabled > button {\r\n  cursor: not-allowed;\r\n}\r\n\r\n.postcube-button>button {\r\n  color: inherit;\r\n  font-size: var(--font-size-m);\r\n  font-weight: 400;\r\n  letter-spacing: 0;\r\n  line-height: 20px;\r\n  height: 100%;\r\n  width: 100%;\r\n  text-align: center;\r\n  white-space: nowrap;\r\n  border: 0 none;\r\n  background-color: transparent;\r\n  cursor: pointer;\r\n}\r\n\r\n.postcube-button.postcube-button--secondary > button {\r\n  color: var(--color-primary);\r\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}