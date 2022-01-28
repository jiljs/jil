/* eslint-disable @typescript-eslint/no-explicit-any */
import {enforce} from './enforce';
import {EncodingError} from './error';

/*
 * Constants
 */

const HI = 1 / 0x100000000;
const {MAX_SAFE_INTEGER} = Number;
const F32_ARRAY = new Float32Array(1);
const F328_ARRAY = new Uint8Array(F32_ARRAY.buffer);
const F64_ARRAY = new Float64Array(1);
const F648_ARRAY = new Uint8Array(F64_ARRAY.buffer);

F32_ARRAY[0] = -1;

const BIG_ENDIAN = F328_ARRAY[3] === 0;

/*
 * Read Unsigned LE
 */

export function readU(data: Buffer, off: number, len: number) {
  switch (len) {
    case 8:
      return readU64(data, off);
    case 7:
      return readU56(data, off);
    case 6:
      return readU48(data, off);
    case 5:
      return readU40(data, off);
    case 4:
      return readU32(data, off);
    case 3:
      return readU24(data, off);
    case 2:
      return readU16(data, off);
    case 1:
      return readU8(data, off);
    default:
      throw new EncodingError(off, 'Invalid read length');
  }
}

export function readU64(data: Buffer, off: number) {
  const hi = readU32(data, off + 4);
  const lo = readU32(data, off);

  check((hi & 0xffe00000) === 0, off, 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readU56(data: Buffer, off: number) {
  const hi = readU24(data, off + 4);
  const lo = readU32(data, off);

  check((hi & 0xffe00000) === 0, off, 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readU48(data: Buffer, off: number) {
  return (
    data[off++] +
    data[off++] * 0x100 +
    data[off++] * 0x10000 +
    data[off++] * 0x1000000 +
    data[off++] * 0x100000000 +
    data[off] * 0x10000000000
  );
}

export function readU40(data: Buffer, off: number) {
  return data[off++] + data[off++] * 0x100 + data[off++] * 0x10000 + data[off++] * 0x1000000 + data[off] * 0x100000000;
}

export function readU32(data: Buffer, off: number) {
  return data[off++] + data[off++] * 0x100 + data[off++] * 0x10000 + data[off] * 0x1000000;
}

export function readU24(data: Buffer, off: number) {
  return data[off++] + data[off++] * 0x100 + data[off] * 0x10000;
}

export function readU16(data: Buffer, off: number) {
  return data[off++] + data[off] * 0x100;
}

export function readU8(data: Buffer, off: number) {
  return data[off];
}

/*
 * Read Unsigned BE
 */

export function readUBE(data: Buffer, off: number, len: number) {
  switch (len) {
    case 8:
      return readU64BE(data, off);
    case 7:
      return readU56BE(data, off);
    case 6:
      return readU48BE(data, off);
    case 5:
      return readU40BE(data, off);
    case 4:
      return readU32BE(data, off);
    case 3:
      return readU24BE(data, off);
    case 2:
      return readU16BE(data, off);
    case 1:
      return readU8(data, off);
    default:
      throw new EncodingError(off, 'Invalid read length');
  }
}

export function readU64BE(data: Buffer, off: number) {
  const hi = readU32BE(data, off);
  const lo = readU32BE(data, off + 4);

  check((hi & 0xffe00000) === 0, off, 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readU56BE(data: Buffer, off: number) {
  const hi = readU24BE(data, off);
  const lo = readU32BE(data, off + 3);

  check((hi & 0xffe00000) === 0, off, 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readU48BE(data: Buffer, off: number) {
  return (
    data[off++] * 0x10000000000 +
    data[off++] * 0x100000000 +
    data[off++] * 0x1000000 +
    data[off++] * 0x10000 +
    data[off++] * 0x100 +
    data[off]
  );
}

export function readU40BE(data: Buffer, off: number) {
  return data[off++] * 0x100000000 + data[off++] * 0x1000000 + data[off++] * 0x10000 + data[off++] * 0x100 + data[off];
}

export function readU32BE(data: Buffer, off: number) {
  return data[off++] * 0x1000000 + data[off++] * 0x10000 + data[off++] * 0x100 + data[off];
}

export function readU24BE(data: Buffer, off: number) {
  return data[off++] * 0x10000 + data[off++] * 0x100 + data[off];
}

export function readU16BE(data: Buffer, off: number) {
  return data[off++] * 0x100 + data[off];
}

/*
 * Read Signed LE
 */

export function readI(data: Buffer, off: number, len: number) {
  switch (len) {
    case 8:
      return readI64(data, off);
    case 7:
      return readI56(data, off);
    case 6:
      return readI48(data, off);
    case 5:
      return readI40(data, off);
    case 4:
      return readI32(data, off);
    case 3:
      return readI24(data, off);
    case 2:
      return readI16(data, off);
    case 1:
      return readI8(data, off);
    default:
      throw new EncodingError(off, 'Invalid read length');
  }
}

export function readI64(data: Buffer, off: number) {
  const hi = readI32(data, off + 4);
  const lo = readU32(data, off);

  check(isSafe(hi, lo), 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readI56(data: Buffer, off: number) {
  const hi = readI24(data, off + 4);
  const lo = readU32(data, off);

  check(isSafe(hi, lo), 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readI48(data: Buffer, off: number) {
  const val = data[off + 4] + data[off + 5] * 0x100;

  return (
    data[off++] +
    data[off++] * 0x100 +
    data[off++] * 0x10000 +
    data[off] * 0x1000000 +
    (val | ((val & 0x8000) * 0x1fffe)) * 0x100000000
  );
}

export function readI40(data: Buffer, off: number) {
  return (
    data[off++] +
    data[off++] * 0x100 +
    data[off++] * 0x10000 +
    data[off++] * 0x1000000 +
    (data[off] | ((data[off] & 0x80) * 0x1fffffe)) * 0x100000000
  );
}

export function readI32(data: Buffer, off: number) {
  return data[off++] + data[off++] * 0x100 + data[off++] * 0x10000 + (data[off] << 24);
}

export function readI24(data: Buffer, off: number) {
  const val = data[off++] + data[off++] * 0x100 + data[off] * 0x10000;

  return val | ((val & 0x800000) * 0x1fe);
}

export function readI16(data: Buffer, off: number) {
  const val = data[off++] + data[off] * 0x100;
  return val | ((val & 0x8000) * 0x1fffe);
}

export function readI8(data: Buffer, off: number) {
  const val = data[off];
  return val | ((val & 0x80) * 0x1fffffe);
}

/*
 * Read Signed BE
 */

export function readIBE(data: Buffer, off: number, len: number) {
  switch (len) {
    case 8:
      return readI64BE(data, off);
    case 7:
      return readI56BE(data, off);
    case 6:
      return readI48BE(data, off);
    case 5:
      return readI40BE(data, off);
    case 4:
      return readI32BE(data, off);
    case 3:
      return readI24BE(data, off);
    case 2:
      return readI16BE(data, off);
    case 1:
      return readI8(data, off);
    default:
      throw new EncodingError(off, 'Invalid read length');
  }
}

export function readI64BE(data: Buffer, off: number) {
  const hi = readI32BE(data, off);
  const lo = readU32BE(data, off + 4);

  check(isSafe(hi, lo), 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readI56BE(data: Buffer, off: number) {
  const hi = readI24BE(data, off);
  const lo = readU32BE(data, off + 3);

  check(isSafe(hi, lo), 'Number exceeds 2^53-1');

  return hi * 0x100000000 + lo;
}

export function readI48BE(data: Buffer, off: number) {
  const val = data[off++] * 0x100 + data[off++];

  return (
    (val | ((val & 0x8000) * 0x1fffe)) * 0x100000000 +
    data[off++] * 0x1000000 +
    data[off++] * 0x10000 +
    data[off++] * 0x100 +
    data[off]
  );
}

export function readI40BE(data: Buffer, off: number) {
  const val = data[off++];

  return (
    (val | ((val & 0x80) * 0x1fffffe)) * 0x100000000 +
    data[off++] * 0x1000000 +
    data[off++] * 0x10000 +
    data[off++] * 0x100 +
    data[off]
  );
}

export function readI32BE(data: Buffer, off: number) {
  return (data[off++] << 24) + data[off++] * 0x10000 + data[off++] * 0x100 + data[off];
}

export function readI24BE(data: Buffer, off: number) {
  const val = data[off++] * 0x10000 + data[off++] * 0x100 + data[off];

  return val | ((val & 0x800000) * 0x1fe);
}

export function readI16BE(data: Buffer, off: number) {
  const val = data[off++] * 0x100 + data[off];
  return val | ((val & 0x8000) * 0x1fffe);
}

/*
 * Read Float
 */

function readFloatBackwards(data: Buffer, off: number) {
  F328_ARRAY[3] = data[off++];
  F328_ARRAY[2] = data[off++];
  F328_ARRAY[1] = data[off++];
  F328_ARRAY[0] = data[off];
  return F32_ARRAY[0];
}

function readFloatForwards(data: Buffer, off: number) {
  F328_ARRAY[0] = data[off++];
  F328_ARRAY[1] = data[off++];
  F328_ARRAY[2] = data[off++];
  F328_ARRAY[3] = data[off];
  return F32_ARRAY[0];
}

function readDoubleBackwards(data: Buffer, off: number) {
  F648_ARRAY[7] = data[off++];
  F648_ARRAY[6] = data[off++];
  F648_ARRAY[5] = data[off++];
  F648_ARRAY[4] = data[off++];
  F648_ARRAY[3] = data[off++];
  F648_ARRAY[2] = data[off++];
  F648_ARRAY[1] = data[off++];
  F648_ARRAY[0] = data[off];
  return F64_ARRAY[0];
}

function readDoubleForwards(data: Buffer, off: number) {
  F648_ARRAY[0] = data[off++];
  F648_ARRAY[1] = data[off++];
  F648_ARRAY[2] = data[off++];
  F648_ARRAY[3] = data[off++];
  F648_ARRAY[4] = data[off++];
  F648_ARRAY[5] = data[off++];
  F648_ARRAY[6] = data[off++];
  F648_ARRAY[7] = data[off];
  return F64_ARRAY[0];
}

export const readFloat = BIG_ENDIAN ? readFloatBackwards : readFloatForwards;
export const readFloatBE = BIG_ENDIAN ? readFloatForwards : readFloatBackwards;
export const readDouble = BIG_ENDIAN ? readDoubleBackwards : readDoubleForwards;
export const readDoubleBE = BIG_ENDIAN ? readDoubleForwards : readDoubleBackwards;

/*
 * Write Unsigned LE
 */

export function writeU(dst: Buffer, num: number, off: number, len: number) {
  switch (len) {
    case 8:
      return writeU64(dst, num, off);
    case 7:
      return writeU56(dst, num, off);
    case 6:
      return writeU48(dst, num, off);
    case 5:
      return writeU40(dst, num, off);
    case 4:
      return writeU32(dst, num, off);
    case 3:
      return writeU24(dst, num, off);
    case 2:
      return writeU16(dst, num, off);
    case 1:
      return writeU8(dst, num, off);
    default:
      throw new EncodingError(off, 'Invalid write length');
  }
}

export function writeU64(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');
  return write64(dst, num, off, false);
}

export function writeU56(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');
  return write56(dst, num, off, false);
}

export function writeU48(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  const hi = (num * HI) | 0;

  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  dst[off++] = hi;
  dst[off++] = hi >>> 8;

  return off;
}

export function writeU40(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  const hi = (num * HI) | 0;

  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  dst[off++] = hi;

  return off;
}

export function writeU32(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;

  return off;
}

export function writeU24(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;
  num >>>= 8;
  dst[off++] = num;

  return off;
}

export function writeU16(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off++] = num;
  dst[off++] = num >>> 8;

  return off;
}

export function writeU8(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off] = num;

  return off + 1;
}

/*
 * Write Unsigned BE
 */

export function writeUBE(dst: Buffer, num: number, off: number, len: number) {
  switch (len) {
    case 8:
      return writeU64BE(dst, num, off);
    case 7:
      return writeU56BE(dst, num, off);
    case 6:
      return writeU48BE(dst, num, off);
    case 5:
      return writeU40BE(dst, num, off);
    case 4:
      return writeU32BE(dst, num, off);
    case 3:
      return writeU24BE(dst, num, off);
    case 2:
      return writeU16BE(dst, num, off);
    case 1:
      return writeU8(dst, num, off);
    default:
      throw new EncodingError(off, 'Invalid write length');
  }
}

export function writeU64BE(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');
  return write64(dst, num, off, true);
}

export function writeU56BE(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');
  return write56(dst, num, off, true);
}

export function writeU48BE(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  const hi = (num * HI) | 0;

  dst[off++] = hi >>> 8;
  dst[off++] = hi;
  dst[off + 3] = num;
  num >>>= 8;
  dst[off + 2] = num;
  num >>>= 8;
  dst[off + 1] = num;
  num >>>= 8;
  dst[off] = num;

  return off + 4;
}

export function writeU40BE(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off++] = (num * HI) | 0;
  dst[off + 3] = num;
  num >>>= 8;
  dst[off + 2] = num;
  num >>>= 8;
  dst[off + 1] = num;
  num >>>= 8;
  dst[off] = num;

  return off + 4;
}

export function writeU32BE(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off + 3] = num;
  num >>>= 8;
  dst[off + 2] = num;
  num >>>= 8;
  dst[off + 1] = num;
  num >>>= 8;
  dst[off] = num;

  return off + 4;
}

export function writeU24BE(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off + 2] = num;
  num >>>= 8;
  dst[off + 1] = num;
  num >>>= 8;
  dst[off] = num;

  return off + 3;
}

export function writeU16BE(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  dst[off++] = num >>> 8;
  dst[off++] = num;

  return off;
}

/*
 * Write Signed LE
 */

export function writeI(dst: Buffer, num: number, off: number, len: number) {
  switch (len) {
    case 8:
      return writeU64(dst, num, off);
    case 7:
      return writeU56(dst, num, off);
    case 6:
      return writeU48(dst, num, off);
    case 5:
      return writeU40(dst, num, off);
    case 4:
      return writeU24(dst, num, off);
    case 3:
      return writeU32(dst, num, off);
    case 2:
      return writeU16(dst, num, off);
    case 1:
      return writeU8(dst, num, off);
    default:
      throw new EncodingError(off, 'Invalid write length');
  }
}

export function writeI64(dst: Buffer, num: number, off: number) {
  return writeU64(dst, num, off);
}

export function writeI56(dst: Buffer, num: number, off: number) {
  return writeU56(dst, num, off);
}

export function writeI48(dst: Buffer, num: number, off: number) {
  return writeU48(dst, num, off);
}

export function writeI40(dst: Buffer, num: number, off: number) {
  return writeU40(dst, num, off);
}

export function writeI32(dst: Buffer, num: number, off: number) {
  return writeU32(dst, num, off);
}

export function writeI24(dst: Buffer, num: number, off: number) {
  return writeU24(dst, num, off);
}

export function writeI16(dst: Buffer, num: number, off: number) {
  return writeU16(dst, num, off);
}

export function writeI8(dst: Buffer, num: number, off: number) {
  return writeU8(dst, num, off);
}

/*
 * Write Signed BE
 */

export function writeIBE(dst: Buffer, num: number, off: number, len: number) {
  switch (len) {
    case 8:
      return writeU64BE(dst, num, off);
    case 7:
      return writeU56BE(dst, num, off);
    case 6:
      return writeU48BE(dst, num, off);
    case 5:
      return writeU40BE(dst, num, off);
    case 4:
      return writeU32BE(dst, num, off);
    case 3:
      return writeU24BE(dst, num, off);
    case 2:
      return writeU16BE(dst, num, off);
    case 1:
      return writeU8(dst, num, off);
    default:
      throw new EncodingError(off, 'Invalid write length');
  }
}

export function writeI64BE(dst: Buffer, num: number, off: number) {
  return writeU64BE(dst, num, off);
}

export function writeI56BE(dst: Buffer, num: number, off: number) {
  return writeU56BE(dst, num, off);
}

export function writeI48BE(dst: Buffer, num: number, off: number) {
  return writeU48BE(dst, num, off);
}

export function writeI40BE(dst: Buffer, num: number, off: number) {
  return writeU40BE(dst, num, off);
}

export function writeI32BE(dst: Buffer, num: number, off: number) {
  return writeU32BE(dst, num, off);
}

export function writeI24BE(dst: Buffer, num: number, off: number) {
  return writeU24BE(dst, num, off);
}

export function writeI16BE(dst: Buffer, num: number, off: number) {
  return writeU16BE(dst, num, off);
}

function writeDoubleForwards(dst: Buffer, num: number, off: number) {
  enforce(isNumber(num), 'num', 'number');

  F64_ARRAY[0] = num;

  dst[off++] = F648_ARRAY[0];
  dst[off++] = F648_ARRAY[1];
  dst[off++] = F648_ARRAY[2];
  dst[off++] = F648_ARRAY[3];
  dst[off++] = F648_ARRAY[4];
  dst[off++] = F648_ARRAY[5];
  dst[off++] = F648_ARRAY[6];
  dst[off++] = F648_ARRAY[7];

  return off;
}

function writeDoubleBackwards(dst: Buffer, num: number, off: number) {
  enforce(isNumber(num), 'num', 'number');

  F64_ARRAY[0] = num;

  dst[off++] = F648_ARRAY[7];
  dst[off++] = F648_ARRAY[6];
  dst[off++] = F648_ARRAY[5];
  dst[off++] = F648_ARRAY[4];
  dst[off++] = F648_ARRAY[3];
  dst[off++] = F648_ARRAY[2];
  dst[off++] = F648_ARRAY[1];
  dst[off++] = F648_ARRAY[0];

  return off;
}

function writeFloatForwards(dst: Buffer, num: number, off: number) {
  enforce(isNumber(num), 'num', 'number');

  F32_ARRAY[0] = num;

  dst[off++] = F328_ARRAY[0];
  dst[off++] = F328_ARRAY[1];
  dst[off++] = F328_ARRAY[2];
  dst[off++] = F328_ARRAY[3];

  return off;
}

function writeFloatBackwards(dst: Buffer, num: number, off: number) {
  enforce(isNumber(num), 'num', 'number');

  F32_ARRAY[0] = num;

  dst[off++] = F328_ARRAY[3];
  dst[off++] = F328_ARRAY[2];
  dst[off++] = F328_ARRAY[1];
  dst[off++] = F328_ARRAY[0];

  return off;
}

export const writeFloat = BIG_ENDIAN ? writeFloatBackwards : writeFloatForwards;
export const writeFloatBE = BIG_ENDIAN ? writeFloatForwards : writeFloatBackwards;
export const writeDouble = BIG_ENDIAN ? writeDoubleBackwards : writeDoubleForwards;
export const writeDoubleBE = BIG_ENDIAN ? writeDoubleForwards : writeDoubleBackwards;

/*
 * Varints
 */

export function readVarint(data: Buffer, off: number) {
  let value, size;

  checkRead(off < data.length, off);

  switch (data[off]) {
    case 0xff:
      size = 9;
      checkRead(off + size <= data.length, off);
      value = readU64(data, off + 1);
      check(value > 0xffffffff, off, 'Non-canonical varint');
      break;
    case 0xfe:
      size = 5;
      checkRead(off + size <= data.length, off);
      value = readU32(data, off + 1);
      check(value > 0xffff, off, 'Non-canonical varint');
      break;
    case 0xfd:
      size = 3;
      checkRead(off + size <= data.length, off);
      value = readU16(data, off + 1);
      check(value >= 0xfd, off, 'Non-canonical varint');
      break;
    default:
      size = 1;
      value = data[off];
      break;
  }

  return new Varint(size, value);
}

export function writeVarint(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  if (num < 0xfd) {
    dst[off++] = num;
    return off;
  }

  if (num <= 0xffff) {
    dst[off++] = 0xfd;
    return writeU16(dst, num, off);
  }

  if (num <= 0xffffffff) {
    dst[off++] = 0xfe;
    return writeU32(dst, num, off);
  }

  dst[off++] = 0xff;

  return writeU64(dst, num, off);
}

export function sizeVarint(num: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  if (num < 0xfd) return 1;

  if (num <= 0xffff) return 3;

  if (num <= 0xffffffff) return 5;

  return 9;
}

export function readVarint2(data: Buffer, off: number) {
  let num = 0;
  let size = 0;

  for (;;) {
    checkRead(off < data.length, off);

    const ch = data[off++];

    size += 1;

    // Number.MAX_SAFE_INTEGER >>> 7
    check(num <= 0x3fffffffffff - (ch & 0x7f), off, 'Number exceeds 2^53-1');

    // num = (num << 7) | (ch & 0x7f);
    num = num * 0x80 + (ch & 0x7f);

    if ((ch & 0x80) === 0) break;

    check(num !== MAX_SAFE_INTEGER, off, 'Number exceeds 2^53-1');
    num += 1;
  }

  return new Varint(size, num);
}

export function writeVarint2(dst: Buffer, num: number, off: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  const tmp = [];

  let len = 0;

  for (;;) {
    tmp[len] = (num & 0x7f) | (len ? 0x80 : 0x00);

    if (num <= 0x7f) break;

    // num = (num >>> 7) - 1;
    num = (num - (num % 0x80)) / 0x80 - 1;
    len += 1;
  }

  checkRead(off + len + 1 <= dst.length, off);

  do {
    dst[off++] = tmp[len];
  } while (len--);

  return off;
}

export function sizeVarint2(num: number) {
  enforce(Number.isSafeInteger(num), 'num', 'integer');

  let size = 0;

  for (;;) {
    size += 1;

    if (num <= 0x7f) break;

    // num = (num >>> 7) - 1;
    num = (num - (num % 0x80)) / 0x80 - 1;
  }

  return size;
}

/*
 * Bytes
 */

export function sliceBytes(data: Buffer, off: number, size: number) {
  enforce(Buffer.isBuffer(data), 'data', 'buffer');
  enforce(off >>> 0 === off, 'off', 'integer');
  enforce(size >>> 0 === size, 'size', 'integer');

  if (off + size > data.length) throw new EncodingError(off, 'Out of bounds read');

  return data.slice(off, off + size);
}

export function readBytes(data: Buffer, off: number, size: number) {
  enforce(Buffer.isBuffer(data), 'data', 'buffer');
  enforce(off >>> 0 === off, 'off', 'integer');
  enforce(size >>> 0 === size, 'size', 'integer');

  if (off + size > data.length) throw new EncodingError(off, 'Out of bounds read');

  const buf = Buffer.allocUnsafeSlow(size);

  data.copy(buf, 0, off, off + size);

  return buf;
}

export function writeBytes(data: Buffer, value: Buffer, off: number) {
  enforce(Buffer.isBuffer(data), 'data', 'buffer');
  enforce(Buffer.isBuffer(value), 'value', 'buffer');
  enforce(off >>> 0 === off, 'off', 'integer');

  if (off + value.length > data.length) throw new EncodingError(off, 'Out of bounds write');

  return value.copy(data, off, 0, value.length);
}

export function readString(data: Buffer, off: number, size: number, enc?: BufferEncoding) {
  if (enc == null) enc = 'binary';

  enforce(Buffer.isBuffer(data), 'data', 'buffer');
  enforce(off >>> 0 === off, 'off', 'integer');
  enforce(size >>> 0 === size, 'size', 'integer');
  enforce(typeof enc === 'string', 'enc', 'string');

  if (off + size > data.length) throw new EncodingError(off, 'Out of bounds read');

  return data.toString(enc!, off, off + size);
}

export function writeString(data: Buffer, str: string, off: number, enc?: BufferEncoding) {
  if (enc == null) enc = 'binary';

  enforce(Buffer.isBuffer(data), 'data', 'buffer');
  enforce(typeof str === 'string', 'str', 'string');
  enforce(off >>> 0 === off, 'off', 'integer');
  enforce(typeof enc === 'string', 'enc', 'string');

  if (str.length === 0) return 0;

  const size = Buffer.byteLength(str, enc);

  if (off + size > data.length) throw new EncodingError(off, 'Out of bounds write');

  return data.write(str, off, enc);
}

export function realloc(data: Buffer, size: number) {
  enforce(Buffer.isBuffer(data), 'data', 'buffer');

  const buf = Buffer.allocUnsafeSlow(size);

  data.copy(buf, 0);

  return buf;
}

export function copy(data: Buffer) {
  enforce(Buffer.isBuffer(data), 'data', 'buffer');
  return realloc(data, data.length);
}

export function concat(a: Buffer, b: Buffer) {
  enforce(Buffer.isBuffer(a), 'a', 'buffer');
  enforce(Buffer.isBuffer(b), 'b', 'buffer');

  const size = a.length + b.length;
  const buf = Buffer.allocUnsafeSlow(size);

  a.copy(buf, 0);
  b.copy(buf, a.length);

  return buf;
}

/*
 * Size Helpers
 */

export function sizeVarBytes(data: Buffer) {
  enforce(Buffer.isBuffer(data), 'data', 'buffer');
  return sizeVarint(data.length) + data.length;
}

export function sizeVarlen(len: number) {
  return sizeVarint(len) + len;
}

export function sizeVarString(str: string, enc?: BufferEncoding) {
  if (enc == null) enc = 'binary';

  enforce(typeof str === 'string', 'str', 'string');
  enforce(typeof enc === 'string', 'enc', 'string');

  if (str.length === 0) return 1;

  const len = Buffer.byteLength(str, enc);

  return sizeVarint(len) + len;
}

/*
 * Helpers
 */

function isSafe(hi: number, lo: number) {
  if (hi < 0) {
    hi = ~hi;
    if (lo === 0) hi += 1;
  }

  return (hi & 0xffe00000) === 0;
}

export function write64(dst: Buffer, num: number, off: number, be: boolean) {
  let neg = false;

  if (num < 0) {
    num = -num;
    neg = true;
  }

  let hi = (num * HI) | 0;
  let lo = num | 0;

  if (neg) {
    if (lo === 0) {
      hi = (~hi + 1) | 0;
    } else {
      hi = ~hi;
      lo = ~lo + 1;
    }
  }

  if (be) {
    off = writeI32BE(dst, hi, off);
    off = writeI32BE(dst, lo, off);
  } else {
    off = writeI32(dst, lo, off);
    off = writeI32(dst, hi, off);
  }

  return off;
}

export function write56(dst: Buffer, num: number, off: number, be: boolean) {
  let neg = false;

  if (num < 0) {
    num = -num;
    neg = true;
  }

  let hi = (num * HI) | 0;
  let lo = num | 0;

  if (neg) {
    if (lo === 0) {
      hi = (~hi + 1) | 0;
    } else {
      hi = ~hi;
      lo = ~lo + 1;
    }
  }

  if (be) {
    off = writeI24BE(dst, hi, off);
    off = writeI32BE(dst, lo, off);
  } else {
    off = writeI32(dst, lo, off);
    off = writeI24(dst, hi, off);
  }

  return off;
}

export class Varint {
  size: number;
  value: any;
  constructor(size: number, value: any) {
    this.size = size;
    this.value = value;
  }
}

function isNumber(num: any): num is number {
  return typeof num === 'number' && isFinite(num);
}

function checkRead(value: any, offset: number | string) {
  if (!value) throw new EncodingError(offset, 'Out of bounds read', checkRead);
}

function check(value: any, offset: number | string, reason?: string) {
  if (!value) throw new EncodingError(offset, reason, check);
}
