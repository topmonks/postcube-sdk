---
title: Postcube Web SDK
slug: web
submenu: sdk
isMenuItem: true
---

# PostCube Web SDK




# To Be Discarded:


# Deprecated

## Aplikace

Primárně mobilní aplikace PostCube je založená na webových technologiích. Většině uživatelů je distribuovaná v podobě instalovatelné PWA (Progressive Web App) na adrese [app.postcube.cz](https://app.postcube.cz/). Pro iOS uživatele je dostupná v [Apple Store](https://apps.apple.com/us/app/postcube/id1537386836) (veřejnou beta verzi najdete v [TestFlight](https://testflight.apple.com/join/zfgoO80t)).

![App is Web](/assets/images/app-is-web.png)

### Bluetooth

Zámek PostCube schránky je aplikací ovládán pomocí [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). Na iOS, kde toto API není podporováno, je přístup k zámku zajištěn přes [cordova-plugin-ble-central](https://github.com/don/cordova-plugin-ble-central).

Alternativně je možné zámek otevřít pomocí jednorázového kódu vygenerovaného na straně PostCube. Ten pak již jen stačí přeposlat pomocí BLE (Bluetooth Low Energy) na zařízení zámku.

**Ukázka (demo) webové aplikace pro [otevření schránky zde](https://docs.postcube.cz/examples/unlock-device/build/)**.

### SDK API

#### Install

```
npm install @topmonks/postcube
```

### Basic usage

```javascript
import { PostCubeSDK } from '@topmonks/postcube'

console.log(PostCubeSDk.IsConnected) // false
```

## Supported platforms

### Web

Web adapter is using [Web Bluetooth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) under the hood.

#### Use Web adapter
```typescript
import { Cubes, Platform } from '@topmonks/postcube'

Cubes.platform = Platform.web
```


### Capacitor / Web

Capacitor adapter is using Capacitor community's [bluetooth-le](https://github.com/capacitor-community/bluetooth-le) under the hood. This plugin supports also web and hence can be used for both mobile and web. If you intend to use Cubes API on mobile devices, be sure to install and setup the plugin in your Capacitor app - see [installation instructions](https://github.com/capacitor-community/bluetooth-le#installation).

There should be little to no config needed for Android, you will however have to setup Bluetooth permissions for iOS.

#### Use Capacitor adapter
```typescript
import { Cubes, Platform } from '@topmonks/postcube'

Cubes.platform = Platform.capacitor
```


### Node.js

Cubes bluetooth API for Node.js is using [`noble`](https://github.com/abandonware/noble) under the hood.

#### Use Node.js adapter
```typescript
import { Cubes, Platform } from '@topmonks/postcube'

Cubes.platform = Platform.node
```

#### Prerequisites

You need to make sure to install all necessary dependencies based on your host system. See [https://github.com/abandonware/noble#prerequisites](https://github.com/abandonware/noble#prerequisites) for details.

