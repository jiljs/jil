/* eslint-disable @typescript-eslint/no-explicit-any */
declare const Buffer: any;

const hasBuffer = typeof Buffer !== 'undefined';

let textEncoder: TextEncoder | null;
let textDecoder: TextDecoder | null;

export class TinyBuffer {
  readonly buffer: Uint8Array;
  readonly byteLength: number;

  private constructor(buffer: Uint8Array) {
    this.buffer = buffer;
    this.byteLength = this.buffer.byteLength;
  }

  /**
   * When running in a nodejs context, the backing store for the returned `TinyBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static alloc(byteLength: number): TinyBuffer {
    if (hasBuffer) {
      return new TinyBuffer(Buffer.allocUnsafe(byteLength));
    } else {
      return new TinyBuffer(new Uint8Array(byteLength));
    }
  }

  /**
   * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
   * the returned `TinyBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
   * which is not transferable.
   */
  static wrap(actual: Uint8Array): TinyBuffer {
    if (hasBuffer && !Buffer.isBuffer(actual)) {
      // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
      // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
      actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
    }
    return new TinyBuffer(actual);
  }

  /**
   * When running in a nodejs context, the backing store for the returned `TinyBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static fromString(source: string, options?: {dontUseNodeBuffer?: boolean}): TinyBuffer {
    const dontUseNodeBuffer = options?.dontUseNodeBuffer || false;
    if (!dontUseNodeBuffer && hasBuffer) {
      return new TinyBuffer(Buffer.from(source));
    } else {
      if (!textEncoder) {
        textEncoder = new TextEncoder();
      }
      return new TinyBuffer(textEncoder.encode(source));
    }
  }

  /**
   * When running in a nodejs context, the backing store for the returned `TinyBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static fromByteArray(source: number[]): TinyBuffer {
    const result = TinyBuffer.alloc(source.length);
    for (let i = 0, len = source.length; i < len; i++) {
      result.buffer[i] = source[i];
    }
    return result;
  }

  /**
   * When running in a nodejs context, the backing store for the returned `TinyBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  static concat(buffers: TinyBuffer[], totalLength?: number): TinyBuffer {
    if (typeof totalLength === 'undefined') {
      totalLength = 0;
      for (let i = 0, len = buffers.length; i < len; i++) {
        totalLength += buffers[i].byteLength;
      }
    }

    const ret = TinyBuffer.alloc(totalLength);
    let offset = 0;
    for (let i = 0, len = buffers.length; i < len; i++) {
      const element = buffers[i];
      ret.set(element, offset);
      offset += element.byteLength;
    }

    return ret;
  }

  /**
   * When running in a nodejs context, the backing store for the returned `TinyBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferable.
   */
  clone(): TinyBuffer {
    const result = TinyBuffer.alloc(this.byteLength);
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

  slice(start?: number, end?: number): TinyBuffer {
    // IMPORTANT: use subarray instead of slice because TypedArray#slice
    // creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
    // ensures the same, performance, behaviour.
    return new TinyBuffer(this.buffer.subarray(start, end));
  }

  set(array: TinyBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void {
    if (array instanceof TinyBuffer) {
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

  readUInt8(offset: number): number {
    return readUInt8(this.buffer, offset);
  }

  writeUInt8(value: number, offset: number): void {
    writeUInt8(this.buffer, value, offset);
  }
}

export function readUInt16LE(source: Uint8Array, offset: number): number {
  return ((source[offset + 0] << 0) >>> 0) | ((source[offset + 1] << 8) >>> 0);
}

export function writeUInt16LE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset + 0] = value & 0b11111111;
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
    ((source[offset + 0] << 0) >>> 0) |
    ((source[offset + 1] << 8) >>> 0) |
    ((source[offset + 2] << 16) >>> 0) |
    ((source[offset + 3] << 24) >>> 0)
  );
}

export function writeUInt32LE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset + 0] = value & 0b11111111;
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
  return TinyBuffer.wrap(buffer).slice(0, unpadded);
}

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64UrlSafeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Encodes a buffer to a base64 string. */
export function encodeBase64({buffer}: TinyBuffer, padded = true, urlSafe = false) {
  const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
  let output = '';

  const remainder = buffer.byteLength % 3;

  let i = 0;
  for (; i < buffer.byteLength - remainder; i += 3) {
    const a = buffer[i + 0];
    const b = buffer[i + 1];
    const c = buffer[i + 2];

    output += dictionary[a >>> 2];
    output += dictionary[((a << 4) | (b >>> 4)) & 0b111111];
    output += dictionary[((b << 2) | (c >>> 6)) & 0b111111];
    output += dictionary[c & 0b111111];
  }

  if (remainder === 1) {
    const a = buffer[i + 0];
    output += dictionary[a >>> 2];
    output += dictionary[(a << 4) & 0b111111];
    if (padded) {
      output += '==';
    }
  } else if (remainder === 2) {
    const a = buffer[i + 0];
    const b = buffer[i + 1];
    output += dictionary[a >>> 2];
    output += dictionary[((a << 4) | (b >>> 4)) & 0b111111];
    output += dictionary[(b << 2) & 0b111111];
    if (padded) {
      output += '=';
    }
  }

  return output;
}