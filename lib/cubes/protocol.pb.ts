export interface EncryptedPacket {
  encryptionKeyId?: number;
  hashedSecret?: Uint8Array;
  payload?: Uint8Array;
}

export function encodeEncryptedPacket(message: EncryptedPacket): Uint8Array {
  let bb = popByteBuffer();
  _encodeEncryptedPacket(message, bb);
  return toUint8Array(bb);
}

function _encodeEncryptedPacket(message: EncryptedPacket, bb: ByteBuffer): void {
  // optional uint32 encryptionKeyId = 1;
  let $encryptionKeyId = message.encryptionKeyId;
  if ($encryptionKeyId !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $encryptionKeyId);
  }

  // optional bytes hashedSecret = 2;
  let $hashedSecret = message.hashedSecret;
  if ($hashedSecret !== undefined) {
    writeVarint32(bb, 18);
    writeVarint32(bb, $hashedSecret.length), writeBytes(bb, $hashedSecret);
  }

  // optional bytes payload = 3;
  let $payload = message.payload;
  if ($payload !== undefined) {
    writeVarint32(bb, 26);
    writeVarint32(bb, $payload.length), writeBytes(bb, $payload);
  }
}

export function decodeEncryptedPacket(binary: Uint8Array): EncryptedPacket {
  return _decodeEncryptedPacket(wrapByteBuffer(binary));
}

function _decodeEncryptedPacket(bb: ByteBuffer): EncryptedPacket {
  let message: EncryptedPacket = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 encryptionKeyId = 1;
      case 1: {
        message.encryptionKeyId = readVarint32(bb) >>> 0;
        break;
      }

      // optional bytes hashedSecret = 2;
      case 2: {
        message.hashedSecret = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes payload = 3;
      case 3: {
        message.payload = readBytes(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Packet {
  commandId?: number;
  expireAt?: number;
  setKey?: SetKey;
  unlock?: Unlock;
  timeSync?: TimeSync;
  nuke?: Nuke;
  protect?: Protect;
}

export function encodePacket(message: Packet): Uint8Array {
  let bb = popByteBuffer();
  _encodePacket(message, bb);
  return toUint8Array(bb);
}

function _encodePacket(message: Packet, bb: ByteBuffer): void {
  // optional uint32 commandId = 1;
  let $commandId = message.commandId;
  if ($commandId !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $commandId);
  }

  // optional uint32 expireAt = 3;
  let $expireAt = message.expireAt;
  if ($expireAt !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $expireAt);
  }

  // optional SetKey setKey = 4;
  let $setKey = message.setKey;
  if ($setKey !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeSetKey($setKey, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional Unlock unlock = 5;
  let $unlock = message.unlock;
  if ($unlock !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeUnlock($unlock, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional TimeSync timeSync = 6;
  let $timeSync = message.timeSync;
  if ($timeSync !== undefined) {
    writeVarint32(bb, 50);
    let nested = popByteBuffer();
    _encodeTimeSync($timeSync, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional Nuke nuke = 7;
  let $nuke = message.nuke;
  if ($nuke !== undefined) {
    writeVarint32(bb, 58);
    let nested = popByteBuffer();
    _encodeNuke($nuke, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional Protect protect = 8;
  let $protect = message.protect;
  if ($protect !== undefined) {
    writeVarint32(bb, 66);
    let nested = popByteBuffer();
    _encodeProtect($protect, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodePacket(binary: Uint8Array): Packet {
  return _decodePacket(wrapByteBuffer(binary));
}

function _decodePacket(bb: ByteBuffer): Packet {
  let message: Packet = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 commandId = 1;
      case 1: {
        message.commandId = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 expireAt = 3;
      case 3: {
        message.expireAt = readVarint32(bb) >>> 0;
        break;
      }

      // optional SetKey setKey = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.setKey = _decodeSetKey(bb);
        bb.limit = limit;
        break;
      }

      // optional Unlock unlock = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.unlock = _decodeUnlock(bb);
        bb.limit = limit;
        break;
      }

      // optional TimeSync timeSync = 6;
      case 6: {
        let limit = pushTemporaryLength(bb);
        message.timeSync = _decodeTimeSync(bb);
        bb.limit = limit;
        break;
      }

      // optional Nuke nuke = 7;
      case 7: {
        let limit = pushTemporaryLength(bb);
        message.nuke = _decodeNuke(bb);
        bb.limit = limit;
        break;
      }

      // optional Protect protect = 8;
      case 8: {
        let limit = pushTemporaryLength(bb);
        message.protect = _decodeProtect(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface SetKey {
  keyIndex?: number;
  publicKey?: Uint8Array;
  expireAt?: number;
}

export function encodeSetKey(message: SetKey): Uint8Array {
  let bb = popByteBuffer();
  _encodeSetKey(message, bb);
  return toUint8Array(bb);
}

function _encodeSetKey(message: SetKey, bb: ByteBuffer): void {
  // optional uint32 keyIndex = 1;
  let $keyIndex = message.keyIndex;
  if ($keyIndex !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $keyIndex);
  }

  // optional bytes publicKey = 2;
  let $publicKey = message.publicKey;
  if ($publicKey !== undefined) {
    writeVarint32(bb, 18);
    writeVarint32(bb, $publicKey.length), writeBytes(bb, $publicKey);
  }

  // optional uint32 expireAt = 3;
  let $expireAt = message.expireAt;
  if ($expireAt !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $expireAt);
  }
}

export function decodeSetKey(binary: Uint8Array): SetKey {
  return _decodeSetKey(wrapByteBuffer(binary));
}

function _decodeSetKey(bb: ByteBuffer): SetKey {
  let message: SetKey = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 keyIndex = 1;
      case 1: {
        message.keyIndex = readVarint32(bb) >>> 0;
        break;
      }

      // optional bytes publicKey = 2;
      case 2: {
        message.publicKey = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional uint32 expireAt = 3;
      case 3: {
        message.expireAt = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Unlock {
  lockId?: number;
}

export function encodeUnlock(message: Unlock): Uint8Array {
  let bb = popByteBuffer();
  _encodeUnlock(message, bb);
  return toUint8Array(bb);
}

function _encodeUnlock(message: Unlock, bb: ByteBuffer): void {
  // optional uint32 lockId = 1;
  let $lockId = message.lockId;
  if ($lockId !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $lockId);
  }
}

export function decodeUnlock(binary: Uint8Array): Unlock {
  return _decodeUnlock(wrapByteBuffer(binary));
}

function _decodeUnlock(bb: ByteBuffer): Unlock {
  let message: Unlock = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 lockId = 1;
      case 1: {
        message.lockId = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface TimeSync {
  timestamp?: number;
}

export function encodeTimeSync(message: TimeSync): Uint8Array {
  let bb = popByteBuffer();
  _encodeTimeSync(message, bb);
  return toUint8Array(bb);
}

function _encodeTimeSync(message: TimeSync, bb: ByteBuffer): void {
  // optional uint32 timestamp = 1;
  let $timestamp = message.timestamp;
  if ($timestamp !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $timestamp);
  }
}

export function decodeTimeSync(binary: Uint8Array): TimeSync {
  return _decodeTimeSync(wrapByteBuffer(binary));
}

function _decodeTimeSync(bb: ByteBuffer): TimeSync {
  let message: TimeSync = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 timestamp = 1;
      case 1: {
        message.timestamp = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Nuke {
}

export function encodeNuke(message: Nuke): Uint8Array {
  let bb = popByteBuffer();
  _encodeNuke(message, bb);
  return toUint8Array(bb);
}

function _encodeNuke(message: Nuke, bb: ByteBuffer): void {
}

export function decodeNuke(binary: Uint8Array): Nuke {
  return _decodeNuke(wrapByteBuffer(binary));
}

function _decodeNuke(bb: ByteBuffer): Nuke {
  let message: Nuke = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Protect {
}

export function encodeProtect(message: Protect): Uint8Array {
  let bb = popByteBuffer();
  _encodeProtect(message, bb);
  return toUint8Array(bb);
}

function _encodeProtect(message: Protect, bb: ByteBuffer): void {
}

export function decodeProtect(binary: Uint8Array): Protect {
  return _decodeProtect(wrapByteBuffer(binary));
}

function _decodeProtect(bb: ByteBuffer): Protect {
  let message: Protect = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Result {
  commandId?: number;
  value?: number;
  errorCode?: number;
}

export function encodeResult(message: Result): Uint8Array {
  let bb = popByteBuffer();
  _encodeResult(message, bb);
  return toUint8Array(bb);
}

function _encodeResult(message: Result, bb: ByteBuffer): void {
  // optional uint32 commandId = 1;
  let $commandId = message.commandId;
  if ($commandId !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $commandId);
  }

  // optional uint32 value = 2;
  let $value = message.value;
  if ($value !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $value);
  }

  // optional uint32 errorCode = 3;
  let $errorCode = message.errorCode;
  if ($errorCode !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $errorCode);
  }
}

export function decodeResult(binary: Uint8Array): Result {
  return _decodeResult(wrapByteBuffer(binary));
}

function _decodeResult(bb: ByteBuffer): Result {
  let message: Result = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 commandId = 1;
      case 1: {
        message.commandId = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 value = 2;
      case 2: {
        message.value = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 errorCode = 3;
      case 3: {
        message.errorCode = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Long {
  low: number;
  high: number;
  unsigned: boolean;
}

interface ByteBuffer {
  bytes: Uint8Array;
  offset: number;
  limit: number;
}

function pushTemporaryLength(bb: ByteBuffer): number {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb: ByteBuffer, type: number): void {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value: string): Long {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value: Long): string {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value: number): Long {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack: ByteBuffer[] = [];

function popByteBuffer(): ByteBuffer {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb: ByteBuffer): void {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes: Uint8Array): ByteBuffer {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb: ByteBuffer): Uint8Array {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb: ByteBuffer, offset: number): void {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb: ByteBuffer): boolean {
  return bb.offset >= bb.limit;
}

function grow(bb: ByteBuffer, count: number): number {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb: ByteBuffer, count: number): number {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb: ByteBuffer, count: number): Uint8Array {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb: ByteBuffer, buffer: Uint8Array): void {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb: ByteBuffer, count: number): string {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2: number, c3: number, c4: number, c: number;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb: ByteBuffer, text: string): void {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb: ByteBuffer, buffer: ByteBuffer): void {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb: ByteBuffer): number {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb: ByteBuffer): number {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb: ByteBuffer, unsigned: boolean): Long {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb: ByteBuffer, value: Long): void {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb: ByteBuffer): number {
  let c = 0;
  let value = 0;
  let b: number;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb: ByteBuffer, value: number): void {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb: ByteBuffer, unsigned: boolean): Long {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b: number;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb: ByteBuffer, value: Long): void {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb: ByteBuffer): number {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb: ByteBuffer, value: number): void {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb: ByteBuffer): Long {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb: ByteBuffer, value: Long): void {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
