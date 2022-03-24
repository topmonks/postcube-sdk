---
title: Odkaz pro otevření boxu
slug: odkaz
submenu: kuryri
isMenuItem: true
---

# Odkaz pro otevření boxu
Pro otevření boxu stačí znát kód zásilky (například `54RH54`). Malá webová aplikace provede kurýra nalezením boxu
a jeho otevřením:
```
https://app.postcube.cz/messenger/{Kód zásilky}
```

Vygenerovaný odkaz pro zásilku je poskytnut spolu s dalšími údaji při založení zásilky.

Odemykací aplikace je [kompatibilní s těmito prohlížeči](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice):
* Chrome 56+,
* Edge 79+,
* Opera 43+,
* Chrome pro Android 56+,
* Opera pro Android 43+,
* Samsung Internet 6.0+.

Kromě výše uvedených je kompatibilní s iPhone.

Z významnějších nebo historických prohlížečů není kompatibilní a nebude fungovat s:
* WebView Android (vestavěný prohlížeč pro Android aplikace),
* Internet Explorer (již delší dobu není podporovaný obecně),
* Mozilla FireFox (desktop i Android).
