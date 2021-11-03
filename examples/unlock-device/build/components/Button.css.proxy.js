// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".postcube-button {\n  background-color: var(--color-primary);\n  border-radius: 4px;\n  box-shadow: 0px 5px 20px #E5E8EE;\n  display: flex;\n  align-items: center;\n  height: 44px;\n  width: 100%;\n  margin: 4px;\n  box-sizing: border-box;\n}\n\n.postcube-button.postcube-button--secondary {\n  background-color: var(--color-secondary);\n  border: 2px solid var(--color-primary);\n}\n\n.postcube-button.postcube-button--disabled {\n  color: var(--color-grey);\n  background-color: var(--color-silver);\n  --loader-color: var(--color-grey);\n}\n\n.postcube-button.postcube-button--disabled > button {\n  cursor: not-allowed;\n}\n\n.postcube-button>button {\n  color: var(--color-white);\n  font-size: var(--font-size-m);\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 20px;\n  height: 100%;\n  width: 100%;\n  text-align: center;\n  white-space: nowrap;\n  border: 0 none;\n  background-color: transparent;\n  cursor: pointer;\n}\n\n.postcube-button.postcube-button--secondary > button {\n  color: var(--color-primary);\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}