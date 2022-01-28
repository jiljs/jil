/* eslint-disable @typescript-eslint/no-explicit-any */
import {enforce} from './enforce';
import {BufferReader} from './buffer-reader';
import {BufferWriter} from './buffer-writer';
import {StaticWriter} from './static-writer';
import {custom} from './custom';

/**
 * Struct
 */

export class Struct {
  constructor() {}

  inject(obj: any) {
    enforce(obj instanceof this.constructor, 'obj', 'struct');
    return this.decode((obj as Struct).encode());
  }

  clone() {
    const copy = new (this.constructor as typeof Struct)();
    return copy.inject(this);
  }

  /*
   * Bindable
   */

  getSize(extra?: any) {
    return -1;
  }

  write(bw: BufferWriter | StaticWriter, extra?: any) {
    return bw;
  }

  read(br: BufferReader, extra?: any) {
    return this;
  }

  toString(): string {
    return Object.prototype.toString.call(this);
  }

  fromString(str: string, extra?: any) {
    return this;
  }

  getJSON(): any {
    return this;
  }

  fromJSON(json: any, extra?: any) {
    return this;
  }

  fromOptions(options: any, extra?: any) {
    return this;
  }

  from(options: any, extra?: any) {
    return this.fromOptions(options, extra);
  }

  format(): any {
    return this.getJSON();
  }

  /*
   * API
   */

  encode(extra?: any) {
    const size = this.getSize(extra);
    const bw = size === -1 ? new BufferWriter() : new StaticWriter(size);

    this.write(bw, extra);

    return bw.render();
  }

  decode(data: Buffer, extra?: any) {
    const br = new BufferReader(data);

    this.read(br, extra);

    return this;
  }

  toHex(extra?: any) {
    return this.encode(extra).toString('hex');
  }

  fromHex(str: string, extra?: any) {
    enforce(typeof str === 'string', 'str', 'string');

    const size = str.length >>> 1;
    const data = Buffer.from(str, 'hex');

    if (data.length !== size) throw new Error('Invalid hex string.');

    return this.decode(data, extra);
  }

  toBase64(extra?: any) {
    return this.encode(extra).toString('base64');
  }

  fromBase64(str: string, extra?: any) {
    enforce(typeof str === 'string', 'str', 'string');

    const data = Buffer.from(str, 'base64');

    if (str.length > size64(data.length)) throw new Error('Invalid base64 string.');

    return this.decode(data, extra);
  }

  toJSON() {
    return this.getJSON();
  }

  [custom]() {
    return this.format();
  }

  /*
   * Static API
   */

  static read(br: BufferReader, extra?: any) {
    return new this().read(br, extra);
  }

  static decode(data: Buffer, extra?: any) {
    return new this().decode(data, extra);
  }

  static fromHex(str: string, extra?: any) {
    return new this().fromHex(str, extra);
  }

  static fromBase64(str: string, extra?: any) {
    return new this().fromBase64(str, extra);
  }

  static fromString(str: string, extra?: any) {
    return new this().fromString(str, extra);
  }

  static fromJSON(json: any, extra?: any) {
    return new this().fromJSON(json, extra);
  }

  static fromOptions(options: any, extra?: any) {
    return new this().fromOptions(options, extra);
  }

  static from(options: any, extra?: any) {
    return new this().from(options, extra);
  }

  /*
   * Aliases
   */

  toWriter(bw: BufferWriter, extra?: any) {
    return this.write(bw, extra);
  }

  fromReader(br: BufferReader, extra?: any) {
    return this.read(br, extra);
  }

  toRaw(extra?: any) {
    return this.encode(extra);
  }

  fromRaw(data: Buffer, extra?: any) {
    return this.decode(data, extra);
  }

  /*
   * Static Aliases
   */

  static fromReader(br: BufferReader, extra?: any) {
    return this.read(br, extra);
  }

  static fromRaw(data: Buffer, extra?: any) {
    return this.decode(data, extra);
  }
}

/*
 * Helpers
 */

function size64(size: number) {
  const expect = ((4 * size) / 3 + 3) & ~3;
  return expect >>> 0;
}
