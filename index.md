---
layout: landing
title: PostCube SDK
---

# PostCube Integration

## Aplikace

Primárně mobilní aplikace PostCube je založená na webových technologiích. Většině uživatelů je distribuovaná v podobě instalovatelné PWA (Progressive Web App) na adrese [app.postcube.cz](https://app.postcube.cz/). Pro iOS uživatele je dostupná v [Apple Store](https://apps.apple.com/us/app/postcube/id1537386836) (veřejnou beta verzi najdete v [TestFlight](https://testflight.apple.com/join/zfgoO80t)).

![App is Web](/assets/images/app-is-web.png)

### Bluetooth

Zámek PostCube schránky je aplikací ovládán pomocí [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). Na iOS, kde toto API není podporováno, je přístup k zámku zajištěn přes [cordova-plugin-ble-central](https://github.com/don/cordova-plugin-ble-central). 

Alternativně je možné zámek otevřít pomocí jednorázového kódu vygenerovaného na straně PostCube. Ten pak již jen stačí přeposlat pomocí BLE (Bluetooth Low Energy) na zařízení zámku.

**Ukázka (demo) webové aplikace pro [otevření schránky zde](https://sdk.postcube.cz/examples/unlock-device/build/)**.

### SDK API

#### Install

```
npm install @topmonks/postcube
```

### Basic usage

```javascript
import { PostCubeSDK } from '@topmonks/postcube'

console.log(PostCubeSDk.IsConnected) // false
```
