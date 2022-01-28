/*!
 * util.js - encoding utils for javascript
 * Copyright (c) 2018-2019, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcrypto
 */

export namespace util {
  /*
   * Util
   */

  export function countLeft(data: Buffer) {
    expect(Buffer.isBuffer(data)).toBeTruthy();

    let i = 0;

    while (i < data.length && data[i] === 0x00) i += 1;

    let bits = (data.length - i) * 8;

    if (bits === 0) return 0;

    bits -= 8;

    let oct: number = data[i];

    while (oct) {
      bits += 1;
      oct >>>= 1;
    }

    return bits;
  }

  export function countRight(data: Buffer) {
    expect(Buffer.isBuffer(data)).toBeTruthy();

    let i = data.length;

    while (i > 0 && data[i - 1] === 0x00) i -= 1;

    let bits = i * 8;

    if (bits === 0) return 0;

    bits -= 8;

    let oct = data[i - 1];

    while (oct) {
      bits += 1;
      oct >>>= 1;
    }

    return bits;
  }

  export function compareLeft(x: Buffer, y: Buffer) {
    expect(Buffer.isBuffer(x)).toBeTruthy();
    expect(Buffer.isBuffer(y)).toBeTruthy();

    let xpos = 0;
    let xlen = x.length;
    let ypos = 0;
    let ylen = y.length;

    while (xlen > 0 && x[xpos] === 0x00) {
      xpos += 1;
      xlen -= 1;
    }

    while (ylen > 0 && y[ypos] === 0x00) {
      ypos += 1;
      ylen -= 1;
    }

    if (xlen < ylen) return -1;

    if (xlen > ylen) return 1;

    for (let i = 0; i < xlen; i++) {
      if (x[xpos + i] < y[ypos + i]) return -1;

      if (x[xpos + i] > y[ypos + i]) return 1;
    }

    return 0;
  }

  export function compareRight(x: Buffer, y: Buffer) {
    expect(Buffer.isBuffer(x)).toBeTruthy();
    expect(Buffer.isBuffer(y)).toBeTruthy();

    let xlen = x.length;
    let ylen = y.length;

    while (xlen > 0 && x[xlen - 1] === 0x00) xlen -= 1;

    while (ylen > 0 && y[ylen - 1] === 0x00) ylen -= 1;

    if (xlen < ylen) return -1;

    if (xlen > ylen) return 1;

    for (let i = xlen - 1; i >= 0; i--) {
      if (x[i] < y[i]) return -1;

      if (x[i] > y[i]) return 1;
    }

    return 0;
  }

  export function trimLeft(data: Buffer) {
    expect(Buffer.isBuffer(data)).toBeTruthy();

    let i = 0;

    while (i < data.length && data[i] === 0x00) i += 1;

    return data.slice(i);
  }

  export function trimRight(data: Buffer) {
    expect(Buffer.isBuffer(data)).toBeTruthy();

    let i = data.length;

    while (i > 0 && data[i - 1] === 0x00) i -= 1;

    return data.slice(0, i);
  }

  export function padLeft(data: Buffer, size: number) {
    expect(Buffer.isBuffer(data)).toBeTruthy();
    expect(size >>> 0 === size).toBeTruthy();

    if (data.length > size) data = trimLeft(data);

    if (data.length > size) throw new RangeError(`Buffer expected to be ${size} bytes in size.`);

    const out = Buffer.alloc(size, 0x00);

    data.copy(out, size - data.length);

    return out;
  }

  export function padRight(data: Buffer, size: number) {
    expect(Buffer.isBuffer(data)).toBeTruthy();
    expect(size >>> 0 === size).toBeTruthy();

    if (data.length > size) data = trimRight(data);

    if (data.length > size) throw new RangeError(`Buffer expected to be ${size} bytes in size.`);

    const out = Buffer.alloc(size, 0x00);

    data.copy(out, 0);

    return out;
  }
}
