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
Názvy zařízení začínají vždy názvem `"PostCube "`, pak typicky následuje ID boxu.

Deklarují službu s UUID:
* 16-bit `0x8000` (povinná),
* 128-bit `13668000-ede0-45de-87e8-77a6c2b8c0b6` (nepovinná).

Zařízení v okolí filtrujte na prefix a deklarovanou službu, například:
```
const device = await navigator.bluetooth.requestDevice({
    [{ services: [0x8000], namePrefix: 'PostCube ' }],
    acceptAllDevices: false,
    optionalServices: ['13668000-ede0-45de-87e8-77a6c2b8c0b6', 'battery_service'],
});
```

## Otevření boxu binárním klíčem
Binární klíč je předgenerovaný a zašifrovaný příkaz pro konkrétní box k otevření zámku. Poskytuje jej PostCube například
aplikaci kurýra při založení zásilky.

Aplikaci kurýra stačí [navázat komunikaci s boxem](#komunikace-s-boxem) a
zapsat klíč tak, jak byl obdržen (bez serializace), [po částech (chunks)]()
do [charakteristiky zápisu příkazů]() (UUID `13668001-ede0-45de-87e8-77a6c2b8c0b6`).

K otevření boxu s binárním klíčem není nutná žádná další část API a dokumentace mimo zmíněných.

Zbytek dokumentace uvádíme pro úplnost. Mimochodem, pod kapotou je binární klíč níže popsaný příkaz
[Unlock](), předgenerovaný a zašifrovaný.

*Poznámka: S předgenerovaným klíčem nyní nemá aplikace kurýra jak se dozvědět o případném neúspěchu příkazu (nezná ID
zašifrovaného příkazu, ke kterému by mohla číst výsledek z [charakteristiky výsledku příkazů]()). Pracujeme na schůdném
řešení.*

## Charakteristiky
Klient zapisuje do a čte z charakteristik boxu příkazy (binární packety) serializované protokolem
[Protocol Buffers](https://developers.google.com/protocol-buffers/docs/proto3), není-li uvedeno jinak.

### Vstup pro příkazy
UUID: `13668001-ede0-45de-87e8-77a6c2b8c0b6`

Zajišťuje spuštění příkazu, od otevření boxu po reset do továrního nastavení. Ve společné obálce má [každý příkaz
vlastní strukturu](#prikazy).

Binární příkaz (`Packet`) musí být [šifrovaný](#sifrovani-packetu) a zapisuje
se [po částech (chunks)](#chunkovani-zpravy), aby mohla být zpráva delší, než limit 20 bajtů.

Výsledek příkazu je po zapsání a zpracování možné přečíst
z [další chrakteristiky](#vystup-vysledku-prikazu).

Příkaz s sebou nese náhodně generované unikátní ID a časovou platnost, aby se box například nedal otevřít starým
nebo již použitým příkazem.

S výjimkou prvotní inicializace boxu (který se odlišuje absencí `encryptionKeyId`) je struktura zašifrované obálky
`EncryptedPacket`:
```
# Options:
# postcube.EncryptedPacket.hashedSecret   max_size:32 fixed_length:true

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
  }
}
```

* **commandId** - vygenerované ID command
* **encryptionKeyId** - ID použitého šifrovacího klíče (registrovaného s boxem)
* **payload** - zašifrovaný packet 
* **hash** - hash zašifrovaného packetu pro ověření

### Výstup výsledku příkazu
UUID: `13668002-ede0-45de-87e8-77a6c2b8c0b6`

```
message Result {
  uint32 commandId = 1;
  uint32 value = 2;
  uint32 errorCode = 3;
}
```

* **commandId** - vygenerované ID command
* **value** - kód výsledku (tabulka níže), OK je `0x0001`
* **errorCode** - hardwarový chybový kód (pro účely ladění)

| value    | Význam                                               |
|----------|------------------------------------------------------|
| `0x0001` | Příkaz byl úspěšný                                   |
|          | *Ostatní kódy jsou vždy chyba, příkaz se nevykonal:* |
| `0x0002` | Příkaz není podporovaný zařízením                    |
| `0x0003` | Platnost příkazu vypršela                            |
| `0x0004` | Příkaz již byl dříve použit                          |
| `0x0005` | Neplatné ID příkazu                                  |
| `0x0006` | Použitý šifrovací klíč je již neplatný               |
| `0x01**` | *Chyba inicializace boxu (SetKey)*                   |
| `0x0101` | Platnost zapisovaného klíče již vypršela             |
| `0x0102` | Zapisovaný klíč je neplatný nebo poškozený           |
| `0x02**` | *Chyba otevření boxu (Unlock)*                       |
| `0x0201` | Uvedené číslo šifrovacího klíče není registrované    |
| `0x1***` | *Obecná systémová chyba*                             |
| `0x11**` | *Systémová chyba paměti boxu*                        |
| `0x12**` | *Systémová chyba vykonání příkazu*                   |
| `0x13**` | *Systémová chyba zápisu šifrovacích klíčů*           |
| `0x14**` | *Systémová chyba otevření boxu*                      |
| `0x15**` | *Systémová chyba synchronizace času*                 |

### Stav dvířek boxu
UUID: `13668003-ede0-45de-87e8-77a6c2b8c0b6`

Přímá hodnota (není strukturovaná):
* `0x0000` - zavřeno
* `0x0001` - otevřeno

### Verze firmware
UUID: `13668004-ede0-45de-87e8-77a6c2b8c0b6`

Přímá hodnota (není strukturovaná). Obsahuje hash verze firmware (4 bajty).

## Šifrování příkazu

## Chunkování packetu
První bajt (uint8) = LAST_CHUNK:
* 0x0 = ještě bude další chunk
* 0x1 = je to poslední chunk

Chunk size = 19 byte

## Příkazy

### Inicializace boxu / Registrace klíče s boxem
```
# Options:
# postcube.SetKey.publicKey               max_size:64 fixed_length:true

message SetKey {
  uint32 keyIndex = 1;
  bytes publicKey = 2;
  uint32 expireAt = 3;
}
```

* **keyIndex** - do kterého indexu se má klíč registrovat
* **publicKey** - veřejný klíč
* **expireAt** - datum a čas expirace klíče

#### Inicializace boxu v továrním nastavení
Majitel si připraví PIN (uint32). Box má svoje boxId (uint32).

SetKey - nešifrovaný packet s hashedSecret sha256(boxId+PIN) = 32 byte bez `encryptedKeyId` v obálce.

Od teď je zaregistrovaný první klíč a veškerá další komunikace musí být šifrovaná registrovaným klíčem.

### Odemknutí boxu
```
message Unlock {
  uint32 lockId = 1;
}
```

* **lockId** - číslo zámku v multiboxu (`0x0000`-`0x0009`)

### Reset boxu do továrního nastavení
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

* **timestamp** - datum a čas, na který se mají hodiny nastavit
