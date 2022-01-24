/* eslint-disable @typescript-eslint/no-explicit-any */
declare const Buffer: any;

const hasBuffer = typeof Buffer !== "undefined";

let textEncoder: TextEncoder | null;
let textDecoder: TextDecoder | null;

/**
 * A lightweight buffer implementation that have limited functionalities include
 * basic data reading and writing in lightweight usage.
 *
 */
export class DataBuffer {
  readonly buffer: Uint8Array;

  private constructor(buffer: Uint8Array) {
    this.buffer = buffer;
  }

  get length() {
    return this.buffer.length;
  }

  get byteLength() {
    return this.buffer.byteLength;
  }

  static isDataBuffer(obj: any): obj is DataBuffer {
    return (
      obj?.constructor != null &&
      typeof obj.constructor.isDataBuffer === "function" &&
      typeof obj.constructor.alloc === "function"
    );
  }

  /**
   * When running in a nodejs context, the backing store for the returned `DataBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static alloc(byteLength: number): DataBuffer {
    if (hasBuffer) {
      return new DataBuffer(Buffer.allocUnsafe(byteLength));
    } else {
      return new DataBuffer(new Uint8Array(byteLength));
    }
  }

  /**
   * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
   * the returned `DataBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
   * which is not transferable.
   */
  static wrap(actual: Uint8Array): DataBuffer {
    if (hasBuffer && !Buffer.isBuffer(actual)) {
      // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
      // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
      actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
    }
    return new DataBuffer(actual);
  }

  /**
   * When running in a nodejs context, the backing store for the returned `DataBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static fromString(source: string, options?: { dontUseNodeBuffer?: boolean }): DataBuffer {
    const dontUseNodeBuffer = options?.dontUseNodeBuffer || false;
    if (!dontUseNodeBuffer && hasBuffer) {
      return new DataBuffer(Buffer.from(source));
    } else {
      if (!textEncoder) {
        textEncoder = new TextEncoder();
      }
      return new DataBuffer(textEncoder.encode(source));
    }
  }

  /**
   * When running in a nodejs context, the backing store for the returned `DataBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static fromByteArray(source: number[]): DataBuffer {
    const result = DataBuffer.alloc(source.length);
    for (let i = 0, len = source.length; i < len; i++) {
      result.buffer[i] = source[i];
    }
    return result;
  }

  /**
   * When running in a nodejs context, the backing store for the returned `DataBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static concat(buffers: DataBuffer[], totalLength?: number): DataBuffer {
    if (typeof totalLength === "undefined") {
      totalLength = 0;
      for (let i = 0, len = buffers.length; i < len; i++) {
        totalLength += buffers[i].byteLength;
      }
    }

    const ret = DataBuffer.alloc(totalLength);
    let offset = 0;
    for (let i = 0, len = buffers.length; i < len; i++) {
      const element = buffers[i];
      ret.set(element, offset);
      offset += element.byteLength;
    }

    return ret;
  }

  /**
   * When running in a nodejs context, the backing store for the returned `DataBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  clone(): DataBuffer {
    const result = DataBuffer.alloc(this.byteLength);
    result.set(this);
    return result;
  }

  toString(): string {
    if (hasBuffer) {
      return this.buffer.toString();
    } else {
      if (!textDecoder) {
        textDecoder = new TextDecoder();
      }
      return textDecoder.decode(this.buffer);
    }
  }

  slice(start?: number, end?: number): DataBuffer {
    // IMPORTANT: use subarray instead of slice because TypedArray#slice
    // creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
    // ensures the same, performance, behaviour.
    return new DataBuffer(this.buffer.subarray(start, end));
  }

  set(array: DataBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void {
    if (array instanceof DataBuffer) {
      this.buffer.set(array.buffer, offset);
    } else if (array instanceof Uint8Array) {
      this.buffer.set(array, offset);
    } else if (array instanceof ArrayBuffer) {
      this.buffer.set(new Uint8Array(array), offset);
    } else if (ArrayBuffer.isView(array)) {
      this.buffer.set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength), offset);
    } else {
      throw new Error(`Unknown argument 'array'`);
    }
  }

  copy(target: DataBuffer, targetStart?: number, start?: number, end?: number): number {
    if (!DataBuffer.isDataBuffer(target)) throw new TypeError("argument should be a DataBuffer");
    targetStart = targetStart ?? 0;
    start = start ?? 0;
    end = end ?? this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
    if (end < 0) throw new RangeError("sourceEnd out of bounds");

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    const len = end - start;

    if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
      // Use built-in when available, missing from IE11
      this.buffer.copyWithin(targetStart, start, end);
    } else {
      target.set(this.buffer.subarray(start, end), targetStart);
    }

    return len;
  }

  indexOf(val: string | number | DataBuffer, byteOffset: number, encoding?: string) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  }

  lastIndexOf(val: string | number | DataBuffer, byteOffset: number, encoding?: string) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  }

  readUInt32BE(offset: number): number {
    return readUInt32BE(this.buffer, offset);
  }

  writeUInt32BE(value: number, offset: number): void {
    writeUInt32BE(this.buffer, value, offset);
  }

  readUInt32LE(offset: number): number {
    return readUInt32LE(this.buffer, offset);
  }

  writeUInt32LE(value: number, offset: number): void {
    writeUInt32LE(this.buffer, value, offset);
  }

  readUInt16LE(offset: number): number {
    return readUInt16LE(this.buffer, offset);
  }

  writeUInt16LE(value: number, offset: number): void {
    writeUInt16LE(this.buffer, value, offset);
  }

  readUInt16BE(offset: number): number {
    return readUInt16BE(this.buffer, offset);
  }

  writeUInt16BE(value: number, offset: number): void {
    writeUInt16BE(this.buffer, value, offset);
  }

  readUInt8(offset: number): number {
    return readUInt8(this.buffer, offset);
  }

  writeUInt8(value: number, offset: number): void {
    writeUInt8(this.buffer, value, offset);
  }
}


// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// from: https://github.com/feross/buffer/blob/master/index.js#L704
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf(buffer: DataBuffer, val: string | number | DataBuffer, byteOffset: number, encoding?: string, dir?: boolean) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1;

  // Normalize byteOffset
  if (typeof byteOffset === "string") {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset; // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1;
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1;
  }

  // Normalize val
  if (typeof val === "string") {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (DataBuffer.isDataBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === "number") {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === "function") {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError("val must be string, number or Buffer");
}

// from: https://github.com/feross/buffer/blob/master/index.js#L760
function arrayIndexOf(arr: DataBuffer, val: DataBuffer | number[], byteOffset: number, encoding?: string, dir?: boolean) {
  let indexSize = 1;
  let arrLength = arr.length;
  let valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === "ucs2" || encoding === "ucs-2" ||
      encoding === "utf16le" || encoding === "utf-16le") {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read(buf: DataBuffer | number[], i: number) {
    if (Array.isArray(buf)) {
      return buf[i];
    }

    if (indexSize === 1) {
      return buf.buffer[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  let i;
  if (dir) {
    let foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      let found = true;
      for (let j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
  }

  return -1;
}

export function readUInt16BE(source: Uint8Array, offset: number): number {
  return ((source[offset + 1] << 0) >>> 0) | ((source[offset] << 8) >>> 0);
}

export function writeUInt16BE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset + 1] = value;
  value = value >>> 8;
  destination[offset] = value;
}

export function readUInt16LE(source: Uint8Array, offset: number): number {
  return ((source[offset] << 0) >>> 0) | ((source[offset + 1] << 8) >>> 0);
}

export function writeUInt16LE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 1] = value & 0b11111111;
}

export function readUInt32BE(source: Uint8Array, offset: number): number {
  return source[offset] * 2 ** 24 + source[offset + 1] * 2 ** 16 + source[offset + 2] * 2 ** 8 + source[offset + 3];
}

export function writeUInt32BE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset + 3] = value;
  value = value >>> 8;
  destination[offset + 2] = value;
  value = value >>> 8;
  destination[offset + 1] = value;
  value = value >>> 8;
  destination[offset] = value;
}

export function readUInt32LE(source: Uint8Array, offset: number): number {
  return (
    ((source[offset] << 0) >>> 0) |
    ((source[offset + 1] << 8) >>> 0) |
    ((source[offset + 2] << 16) >>> 0) |
    ((source[offset + 3] << 24) >>> 0)
  );
}

export function writeUInt32LE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 1] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 2] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 3] = value & 0b11111111;
}

export function readUInt8(source: Uint8Array, offset: number): number {
  return source[offset];
}

export function writeUInt8(destination: Uint8Array, value: number, offset: number): void {
  destination[offset] = value;
}

/** Decodes base64 to a uint8 array. URL-encoded and unpadded base64 is allowed. */
export function decodeBase64(encoded: string) {
  let building = 0;
  let remainder = 0;
  let bufi = 0;

  // The simpler way to do this is `Uint8Array.from(atob(str), c => c.charCodeAt(0))`,
  // but that's about 10-20x slower than this function in current Chromium versions.

  const buffer = new Uint8Array(Math.floor((encoded.length / 4) * 3));
  const append = (value: number) => {
    switch (remainder) {
      case 3:
        buffer[bufi++] = building | value;
        remainder = 0;
        break;
      case 2:
        buffer[bufi++] = building | (value >>> 2);
        building = value << 6;
        remainder = 3;
        break;
      case 1:
        buffer[bufi++] = building | (value >>> 4);
        building = value << 4;
        remainder = 2;
        break;
      default:
        building = value << 2;
        remainder = 1;
    }
  };

  for (let i = 0; i < encoded.length; i++) {
    const code = encoded.charCodeAt(i);
    // See https://datatracker.ietf.org/doc/html/rfc4648#section-4
    // This branchy code is about 3x faster than an indexOf on a base64 char string.
    if (code >= 65 && code <= 90) {
      append(code - 65); // A-Z starts ranges from char code 65 to 90
    } else if (code >= 97 && code <= 122) {
      append(code - 97 + 26); // a-z starts ranges from char code 97 to 122, starting at byte 26
    } else if (code >= 48 && code <= 57) {
      append(code - 48 + 52); // 0-9 starts ranges from char code 48 to 58, starting at byte 52
    } else if (code === 43 || code === 45) {
      append(62); // "+" or "-" for URLS
    } else if (code === 47 || code === 95) {
      append(63); // "/" or "_" for URLS
    } else if (code === 61) {
      break; // "="
    } else {
      throw new SyntaxError(`Unexpected base64 character ${encoded[i]}`);
    }
  }

  const unpadded = bufi;
  while (remainder > 0) {
    append(0);
  }

  // slice is needed to account for overestimation due to padding
  return DataBuffer.wrap(buffer).slice(0, unpadded);
}

const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64UrlSafeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Encodes a buffer to a base64 string. */
export function encodeBase64({ buffer }: DataBuffer, padded = true, urlSafe = false) {
  const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
  let output = "";

  const remainder = buffer.byteLength % 3;

  let i = 0;
  for (; i < buffer.byteLength - remainder; i += 3) {
    const a = buffer[i];
    const b = buffer[i + 1];
    const c = buffer[i + 2];

    output += dictionary[a >>> 2];
    output += dictionary[((a << 4) | (b >>> 4)) & 0b111111];
    output += dictionary[((b << 2) | (c >>> 6)) & 0b111111];
    output += dictionary[c & 0b111111];
  }

  if (remainder === 1) {
    const a = buffer[i];
    output += dictionary[a >>> 2];
    output += dictionary[(a << 4) & 0b111111];
    if (padded) {
      output += "==";
    }
  } else if (remainder === 2) {
    const a = buffer[i];
    const b = buffer[i + 1];
    output += dictionary[a >>> 2];
    output += dictionary[((a << 4) | (b >>> 4)) & 0b111111];
    output += dictionary[(b << 2) & 0b111111];
    if (padded) {
      output += "=";
    }
  }

  return output;
}
