---
title: BLE Command Encoding
slug: encoding
submenu: bluetooth
isMenuItem: true
---

To compose a binary command which will then be transmitted via Bluetooth, use either the Protol Buffers template (`/protocol.proto` and `/protocol.options` files - **the hard way**), or use functions provided by this package (the easy way):

## `EncodingOptions`

```typescript
interface EncodingOptions {
    commandId?: number
    expireAt?: number
    boxId?: string|Iterable<number>
    secretCode?: string|Iterable<number>
    keys?: EncryptionKeys
    encryptionStrategy?: EncodingEncryptionStrategy
}
```

```typescript
interface EncryptionKeys {
    keyIndex?: number
    hashedSecretCode?: Uint8Array
    privateKey?: Uint8Array|number[]
    publicKey?: Uint8Array|number[]
}
```

```typescript
enum EncodingEncryptionStrategy {
    secretCode = 'secretcode',
    key        = 'key',
}
```

## `encodeCommand(command: Command, options: EncodingOptions)`

### Example: encode unlock command:

```typescript
import { encodeCommand } from '@topmonks/postcube'

encodeCommand({
    unlock: {
        lockId: 2,
    },
}, {
    keys: {
        hashedSecretCode: new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]), // 32-byte
        keyIndex: 0,
        privateKey: new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]), // 32-byte
        publicKey: new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]), // 64-byte
    },
})
```
