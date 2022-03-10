---
title: BLE API Docs
slug: bluetooth
isSubmenu: true
---

### Content

- [(Binary) command encoding](./encoding)


<br/><br/><br/><br/><br/>

# To Be Discarted:

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

