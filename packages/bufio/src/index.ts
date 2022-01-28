/* eslint-disable @typescript-eslint/naming-convention */

import {EncodingError} from './error';
import {BufferReader} from './buffer-reader';
import {BufferWriter} from './buffer-writer';
import {StaticWriter} from './static-writer';
import {enforce} from './enforce';
import * as encoding from './encoding';

export * from './custom';
export * from './error';
export * from './reader';
export * from './writer';
export * from './buffer-reader';
export * from './buffer-writer';
export * from './static-writer';
export * from './struct';

export {encoding};

export function read(data: Buffer, zeroCopy = false) {
  return new BufferReader(data, zeroCopy);
}

export function write(): BufferWriter;
export function write(size: number): StaticWriter;
export function write(size?: number) {
  return size != null ? new StaticWriter(size) : new BufferWriter();
}

export function pool(size: number) {
  return StaticWriter.pool(size);
}

function _read<T>(func: (data: Buffer, off: number) => T, size: number) {
  return function (data: Buffer, off: number) {
    enforce(Buffer.isBuffer(data), 'data', 'buffer');
    enforce(off >>> 0 === off, 'off', 'integer');

    if (off + size > data.length) throw new EncodingError(off, 'Out of bounds read');

    return func(data, off);
  };
}

function _readn<T>(func: (data: Buffer, off: number, len: number) => T) {
  return function (data: Buffer, off: number, len: number) {
    enforce(Buffer.isBuffer(data), 'data', 'buffer');
    enforce(off >>> 0 === off, 'off', 'integer');
    enforce(len >>> 0 === len, 'len', 'integer');

    if (off + len > data.length) throw new EncodingError(off, 'Out of bounds read');

    return func(data, off, len);
  };
}

function _readvar<T>(func: (data: Buffer, off: number) => T) {
  return function (data: BufferReader, off: number) {
    enforce(Buffer.isBuffer(data), 'data', 'buffer');
    enforce(off >>> 0 === off, 'off', 'integer');
    return func(data, off);
  };
}

function _write<T>(func: (data: Buffer, num: number, off: number) => T, size: number) {
  return function (data: Buffer, num: number, off: number) {
    enforce(Buffer.isBuffer(data), 'data', 'buffer');
    enforce(off >>> 0 === off, 'off', 'integer');

    if (off + size > data.length) throw new EncodingError(off, 'Out of bounds write');

    return func(data, num, off);
  };
}

function _writen<T>(func: (data: Buffer, num: number, off: number, len: number) => T) {
  return function (data: Buffer, num: number, off: number, len: number) {
    enforce(Buffer.isBuffer(data), 'data', 'buffer');
    enforce(off >>> 0 === off, 'off', 'integer');
    enforce(len >>> 0 === len, 'len', 'integer');

    if (off + len > data.length) throw new EncodingError(off, 'Out of bounds write');

    return func(data, num, off, len);
  };
}

function _writecb<T>(func: (data: Buffer, num: number, off: number) => T, size: (n: number) => number) {
  return function (data: Buffer, num: number, off: number) {
    enforce(Buffer.isBuffer(data), 'data', 'buffer');
    enforce(off >>> 0 === off, 'off', 'integer');

    if (off + size(num) > data.length) throw new EncodingError(off, 'Out of bounds write');

    return func(data, num, off);
  };
}

export const readU = _readn(encoding.readU);
export const readU64 = _read(encoding.readU64, 8);
export const readU56 = _read(encoding.readU56, 7);
export const readU48 = _read(encoding.readU48, 6);
export const readU40 = _read(encoding.readU40, 5);
export const readU32 = _read(encoding.readU32, 4);
export const readU24 = _read(encoding.readU24, 3);
export const readU16 = _read(encoding.readU16, 2);
export const readU8 = _read(encoding.readU8, 1);

export const readUBE = _readn(encoding.readUBE);
export const readU64BE = _read(encoding.readU64BE, 8);
export const readU56BE = _read(encoding.readU56BE, 7);
export const readU48BE = _read(encoding.readU48BE, 6);
export const readU40BE = _read(encoding.readU40BE, 5);
export const readU32BE = _read(encoding.readU32BE, 4);
export const readU24BE = _read(encoding.readU24BE, 3);
export const readU16BE = _read(encoding.readU16BE, 2);

export const readI = _readn(encoding.readI);
export const readI64 = _read(encoding.readI64, 8);
export const readI56 = _read(encoding.readI56, 7);
export const readI48 = _read(encoding.readI48, 6);
export const readI40 = _read(encoding.readI40, 5);
export const readI32 = _read(encoding.readI32, 4);
export const readI24 = _read(encoding.readI24, 3);
export const readI16 = _read(encoding.readI16, 2);
export const readI8 = _read(encoding.readI8, 1);

export const readIBE = _readn(encoding.readIBE);
export const readI64BE = _read(encoding.readI64BE, 8);
export const readI56BE = _read(encoding.readI56BE, 7);
export const readI48BE = _read(encoding.readI48BE, 6);
export const readI40BE = _read(encoding.readI40BE, 5);
export const readI32BE = _read(encoding.readI32BE, 4);
export const readI24BE = _read(encoding.readI24BE, 3);
export const readI16BE = _read(encoding.readI16BE, 2);

export const readFloat = _read(encoding.readFloat, 4);
export const readFloatBE = _read(encoding.readFloatBE, 4);
export const readDouble = _read(encoding.readDouble, 8);
export const readDoubleBE = _read(encoding.readDoubleBE, 8);

export const writeU = _writen(encoding.writeU);
export const writeU64 = _write(encoding.writeU64, 8);
export const writeU56 = _write(encoding.writeU56, 7);
export const writeU48 = _write(encoding.writeU48, 6);
export const writeU40 = _write(encoding.writeU40, 5);
export const writeU32 = _write(encoding.writeU32, 4);
export const writeU24 = _write(encoding.writeU24, 3);
export const writeU16 = _write(encoding.writeU16, 2);
export const writeU8 = _write(encoding.writeU8, 1);

export const writeUBE = _writen(encoding.writeUBE);
export const writeU64BE = _write(encoding.writeU64BE, 8);
export const writeU56BE = _write(encoding.writeU56BE, 7);
export const writeU48BE = _write(encoding.writeU48BE, 6);
export const writeU40BE = _write(encoding.writeU40BE, 5);
export const writeU32BE = _write(encoding.writeU32BE, 4);
export const writeU24BE = _write(encoding.writeU24BE, 3);
export const writeU16BE = _write(encoding.writeU16BE, 2);

export const writeI = _writen(encoding.writeI);
export const writeI64 = _write(encoding.writeI64, 8);
export const writeI56 = _write(encoding.writeI56, 7);
export const writeI48 = _write(encoding.writeI48, 6);
export const writeI40 = _write(encoding.writeI40, 5);
export const writeI32 = _write(encoding.writeI32, 4);
export const writeI24 = _write(encoding.writeI24, 3);
export const writeI16 = _write(encoding.writeI16, 2);
export const writeI8 = _write(encoding.writeI8, 1);

export const writeIBE = _writen(encoding.writeIBE);
export const writeI64BE = _write(encoding.writeI64BE, 8);
export const writeI56BE = _write(encoding.writeI56BE, 7);
export const writeI48BE = _write(encoding.writeI48BE, 6);
export const writeI40BE = _write(encoding.writeI40BE, 5);
export const writeI32BE = _write(encoding.writeI32BE, 4);
export const writeI24BE = _write(encoding.writeI24BE, 3);
export const writeI16BE = _write(encoding.writeI16BE, 2);

export const writeFloat = _write(encoding.writeFloat, 4);
export const writeFloatBE = _write(encoding.writeFloatBE, 4);
export const writeDouble = _write(encoding.writeDouble, 8);
export const writeDoubleBE = _write(encoding.writeDoubleBE, 8);

export const readVarint = _readvar(encoding.readVarint);
export const writeVarint = _writecb(encoding.writeVarint, encoding.sizeVarint);
export const sizeVarint = encoding.sizeVarint;
export const readVarint2 = _readvar(encoding.readVarint2);
export const writeVarint2 = _writecb(encoding.writeVarint2, encoding.sizeVarint2);
export const sizeVarint2 = encoding.sizeVarint2;

export const sliceBytes = encoding.sliceBytes;
export const readBytes = encoding.readBytes;
export const writeBytes = encoding.writeBytes;
export const readString = encoding.readString;
export const writeString = encoding.writeString;

export const realloc = encoding.realloc;
export const copy = encoding.copy;
export const concat = encoding.concat;

export const sizeVarBytes = encoding.sizeVarBytes;
export const sizeVarlen = encoding.sizeVarlen;
export const sizeVarString = encoding.sizeVarString;
