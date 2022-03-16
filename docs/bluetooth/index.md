---
title: Bluetooth API Docs
slug: bluetooth
isSubmenu: true
---

# Bluetooth API PostCube
Aplikace komunikuje s boxem vlastním protokolem přes rozhraní Bluetooth, konkrétně 
[Bluetooth Low Energy (BLE)](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy).

Zapisuje a čte data v charakteristikách služby. Bezpečnost komunikace je řešena na úrovni těchto příkazů. BLE
Legacy pairing ani LE Secure Connection se pro svou komplikovanost nevyužívá.

Jako hotové implementace protokolu PostCube je možné využít SDK pro platformy:
* Webový prohlížeč - [PostCube Web SDK](https://docs.postcube.cz/docs/sdk/web.html)
* Node.js - [PostCube Node.js SDK](https://docs.postcube.cz/docs/sdk/node.html)

Probíhají přípravy pro další platformy:
* Nativní Android - [PostCube Android SDK](https://docs.postcube.cz/docs/sdk/android.html)
* Nativní iOS - [PostCube iOS SDK](https://docs.postcube.cz/docs/sdk/ios.html)

## Navázání komunikace s boxem
Boxy fungují jako [GATT server](https://www.bluetooth.com/bluetooth-resources/intro-to-bluetooth-gap-gatt/).
Názvy zařízení začínají vždy názvem `"PostCube "`.

Deklarují službu s UUID:
* 16-bit `0x8000`,
* 128-bit `13668000-ede0-45de-87e8-77a6c2b8c0b6`.

Zařízení v okolí filtrujte na prefix a deklarovanou službu, například:
```
const device = await navigator.bluetooth.requestDevice({
    [{ services: [0x8000], namePrefix: 'PostCube ' }],
    acceptAllDevices: false,
    optionalServices: ['13668000-ede0-45de-87e8-77a6c2b8c0b6', 'battery_service'],
});
```

## Komunikace s boxem
Klient zapisuje do charakteristiky boxu binární příkazy šifrované klíčem, který je registrovaný ve vnitřní paměti boxu.
Jedním z takových příkazů je například odemknutí boxu. Výsledky příkazů čte klient z jiné charakteristiky. 

Charakteristiky jsou omezené velikostí přenesených dat, proto se delší příkazy rozdělují do packetů.

Packety jsou kódovány protokolem [Protocol Buffers](https://developers.google.com/protocol-buffers/docs/proto3).

### Struktura příkazu
```
postcube.EncryptedPacket.hashedSecret   max_size:32 fixed_length:true
```

```
syntax = "proto3";
package postcube;

message EncryptedPacket {
  uint32 commandId = 1;
  uint32 encryptionKeyId = 2;
  bytes payload = 3;
  bytes hash = 4;
}

message Packet {
  uint32 expireAt = 3;
  oneof command {
    SetKey setKey = 4;
    Unlock unlock = 5;
    TimeSync timeSync = 6;
    Nuke nuke = 7;
    Protect protect = 8;
  }
}
```


- [(Binary) command encoding](./encoding)

### Šifrování příkazu

### Chunkování packetu
První bajt (uint8) = HAS_MORE:
* 0x1 = ještě bude další chunk
* 0x0 = je to poslední chunk

Chunk size = 19 byte

## Charakteristiky

### Vstup pro příkazy
UUID: `13668001-ede0-45de-87e8-77a6c2b8c0b6`

### Výstup výsledku příkazů
UUID: `13668002-ede0-45de-87e8-77a6c2b8c0b6`

### Stav dvířek boxu
UUID: `13668003-ede0-45de-87e8-77a6c2b8c0b6`

0 - zavřeno
1 - otevřeno

### Verze firmware
UUID: `13668004-ede0-45de-87e8-77a6c2b8c0b6`

Obsahuje hash verze firmware (7 bajtů).

## Příkazy

### Inicializace boxu
```
postcube.SetKey.publicKey               max_size:64 fixed_length:true
```

```
message SetKey {
  uint32 keyIndex = 1;
  bytes publicKey = 2;
  uint32 expireAt = 3;
}
```

### Registrace klíče s boxem
```
postcube.SetKey.publicKey               max_size:64 fixed_length:true
```

```
message SetKey {
  uint32 keyIndex = 1;
  bytes publicKey = 2;
  uint32 expireAt = 3;
}
```


### Odemknutí boxu
lockId = číslo zámku v multiboxu (až 10 lockId 0-9)
```
message Unlock {
  uint32 lockId = 1;
}
```

### Reset boxu
Majitel může resetovat box do továrního nastavení.
```
message Nuke {
}
```

### Synchronizace času boxu
Klientská aplikace majitele občas synchronizuje čas boxu. 
```
message TimeSync {
  uint32 timestamp = 1;
}
```

### Čtení výsledku boxu
commandId - vygenerované ID command
value - náš error kód - https://github.com/topmonks/postcube/blob/master/firmware/multibox/application/errors.h
errorCode - interní error kód (pro debug)

```
message Result {
  uint32 commandId = 1;
  uint32 value = 2;
  uint32 errorCode = 3;
}
```

## Scénáře použití

### Majitel si poprvé nastavuje box
1. Majitel si připraví PIN
2. SetKey - pošle nešifrovaný packet s hashedSecret sha256(boxId::uint32+PIN::uint32)::32byte bez encryptedKeyId
3. Teď už je tedy zaregistrovaný první klíč a veškerá další komunikace musí být šifrovaná registrovaným 

### Kurýr odemyká box pro vyzvednutí/doručení
1. 
2. 
3. 
4. 
5. 
6. 


<br/><br/><br/><br/><br/>

# To Be Discarded:

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

