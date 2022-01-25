/* eslint-disable @typescript-eslint/no-explicit-any */
import {DataBuffer} from './buffer';
import {NotImplementedError} from '../errors/not-implemented';

const symbol = Symbol.for('BufferList');

export class BufferList {
  readonly [symbol] = true;
  length: number;

  protected _bufs: DataBuffer[];

  constructor(buf?: DataBuffer | DataBuffer[]) {
    this._bufs = [];
    this.length = 0;

    if (buf) {
      this.append(buf);
    }
  }

  static isBufferList(x: any): x is BufferList {
    return x?.[symbol];
  }

  get(index: number) {
    if (index > this.length || index < 0) {
      return undefined;
    }

    const offset = this._offset(index);

    return this._bufs[offset[0]].buffer[offset[1]];
  }

  slice(start?: number, end?: number) {
    if (typeof start === 'number' && start < 0) {
      start += this.length;
    }

    if (typeof end === 'number' && end < 0) {
      end += this.length;
    }

    return this.copy(null, 0, start, end);
  }

  copy(dst: DataBuffer | null, dstStart: number, srcStart?: number, srcEnd?: number): DataBuffer {
    if (typeof srcStart !== 'number' || srcStart < 0) {
      srcStart = 0;
    }

    if (typeof srcEnd !== 'number' || srcEnd > this.length) {
      srcEnd = this.length;
    }

    if (srcStart >= this.length) {
      return dst || DataBuffer.alloc(0);
    }

    if (srcEnd <= 0) {
      return dst || DataBuffer.alloc(0);
    }

    const copy = !!dst;
    const off = this._offset(srcStart);
    const len = srcEnd - srcStart;
    let bytes = len;
    let bufoff = (copy && dstStart) || 0;
    let start = off[1];

    // copy/slice everything
    if (srcStart === 0 && srcEnd === this.length) {
      if (!dst) {
        // slice, but full concat if multiple buffers
        return this._bufs.length === 1 ? this._bufs[0] : DataBuffer.concat(this._bufs, this.length);
      }

      // copy, need to copy individual buffers
      for (const item of this._bufs) {
        item.copy(dst, bufoff);
        bufoff += item.length;
      }

      return dst;
    }

    // easy, cheap case where it's a subset of one of the buffers
    if (bytes <= this._bufs[off[0]].length - start) {
      if (!dst) {
        return this._bufs[off[0]].slice(start, start + bytes);
      }
      this._bufs[off[0]].copy(dst, dstStart, start, start + bytes);
      return dst;
    }

    if (!dst) {
      // a slice, we need something to copy in to
      dst = DataBuffer.alloc(len);
    }

    for (let i = off[0]; i < this._bufs.length; i++) {
      const l = this._bufs[i].length - start;

      if (bytes > l) {
        this._bufs[i].copy(dst, bufoff, start);
        bufoff += l;
      } else {
        this._bufs[i].copy(dst, bufoff, start, start + bytes);
        bufoff += l;
        break;
      }

      bytes -= l;

      if (start) {
        start = 0;
      }
    }

    // safeguard so that we don't return uninitialized memory
    if (dst.length > bufoff) return dst.slice(0, bufoff);

    return dst;
  }

  shallowSlice(start: number, end: number) {
    start = start || 0;
    end = typeof end !== 'number' ? this.length : end;

    if (start < 0) {
      start += this.length;
    }

    if (end < 0) {
      end += this.length;
    }

    if (start === end) {
      return this._new();
    }

    const startOffset = this._offset(start);
    const endOffset = this._offset(end);
    const buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1);

    if (endOffset[1] === 0) {
      buffers.pop();
    } else {
      buffers[buffers.length - 1] = buffers[buffers.length - 1].slice(0, endOffset[1]);
    }

    if (startOffset[1] !== 0) {
      buffers[0] = buffers[0].slice(startOffset[1]);
    }

    return this._new(buffers);
  }

  toString(start?: number, end?: number) {
    return this.slice(start, end).toString();
  }

  consume(bytes: number) {
    // first, normalize the argument, in accordance with how Buffer does it
    bytes = Math.trunc(bytes);
    // do nothing if not a positive number
    if (Number.isNaN(bytes) || bytes <= 0) return this;

    while (this._bufs.length) {
      if (bytes >= this._bufs[0].length) {
        bytes -= this._bufs[0].length;
        this.length -= this._bufs[0].length;
        this._bufs.shift();
      } else {
        this._bufs[0] = this._bufs[0].slice(bytes);
        this.length -= bytes;
        break;
      }
    }

    return this;
  }

  duplicate() {
    const copy = this._new();

    for (const item of this._bufs) {
      copy.append(item);
    }

    return copy;
  }

  append(buf: number | string | DataBuffer | DataBuffer[] | BufferList | Uint8Array) {
    if (buf == null) {
      return this;
    }

    if (typeof buf === 'number') {
      this._appendBuffer(DataBuffer.fromString(buf.toString()));
    } else if (typeof buf === 'string') {
      this._appendBuffer(DataBuffer.fromString(buf));
    } else if (Array.isArray(buf)) {
      for (const item of buf) {
        this.append(item);
      }
    } else if (this._isBufferList(buf)) {
      // unwrap argument into individual BufferLists
      for (const item of (buf as any)._bufs) {
        this.append(item);
      }
    } else if (DataBuffer.isDataBuffer(buf)) {
      this._appendBuffer(buf);
    } else {
      this._appendBuffer(DataBuffer.wrap(buf));
    }

    return this;
  }

  indexOf(search: string | number | Uint8Array | BufferList | DataBuffer, offset?: number /*, encoding?: string*/) {
    // if (encoding === undefined && typeof offset === "string") {
    //   encoding = offset;
    //   offset = undefined;
    // }

    if (typeof search === 'function' || Array.isArray(search)) {
      throw new TypeError('The "value" argument must be one of type string, Buffer, BufferList, or Uint8Array.');
    } else if (typeof search === 'number') {
      search = DataBuffer.fromByteArray([search]);
    } else if (typeof search === 'string') {
      search = DataBuffer.fromString(search /*, encoding*/);
    } else if (this._isBufferList(search)) {
      search = search.slice();
    } else if (!DataBuffer.isDataBuffer(search)) {
      search = DataBuffer.wrap(search);
    }

    offset = Number(offset || 0);

    if (isNaN(offset)) {
      offset = 0;
    }

    if (offset < 0) {
      offset = this.length + offset;
    }

    if (offset < 0) {
      offset = 0;
    }

    if (search.length === 0) {
      return offset > this.length ? this.length : offset;
    }

    const blOffset = this._offset(offset);
    let blIndex = blOffset[0]; // index of which internal buffer we're working on
    let buffOffset = blOffset[1]; // offset of the internal buffer we're working on

    // scan over each buffer
    for (; blIndex < this._bufs.length; blIndex++) {
      const buff = this._bufs[blIndex];

      while (buffOffset < buff.length) {
        const availableWindow = buff.length - buffOffset;

        if (availableWindow >= search.length) {
          const nativeSearchResult = buff.indexOf(search, buffOffset);

          if (nativeSearchResult !== -1) {
            return this._reverseOffset([blIndex, nativeSearchResult]);
          }

          buffOffset = buff.length - search.length + 1; // end of native search window
        } else {
          const revOffset = this._reverseOffset([blIndex, buffOffset]);

          if (this._match(revOffset, search)) {
            return revOffset;
          }

          buffOffset++;
        }
      }

      buffOffset = 0;
    }

    return -1;
  }

  readUInt32BE(offset = 0): number {
    throw new NotImplementedError();
  }

  readUInt32LE(offset = 0): number {
    throw new NotImplementedError();
  }

  readUInt16BE(offset = 0): number {
    throw new NotImplementedError();
  }

  readUInt16LE(offset = 0): number {
    throw new NotImplementedError();
  }

  readUInt8(offset = 0): number {
    throw new NotImplementedError();
  }

  protected _new(buf?: DataBuffer | DataBuffer[]) {
    return new BufferList(buf);
  }

  protected _offset(offset: number): [number, number] {
    if (offset === 0) {
      return [0, 0];
    }

    let tot = 0;

    for (let i = 0; i < this._bufs.length; i++) {
      const t = tot + this._bufs[i].length;
      if (offset < t || i === this._bufs.length - 1) {
        return [i, offset - tot];
      }
      tot = t;
    }

    return [0, 0];
  }

  protected _reverseOffset(blOffset: [number, number]) {
    const bufferId = blOffset[0];
    let offset = blOffset[1];

    for (let i = 0; i < bufferId; i++) {
      offset += this._bufs[i].length;
    }

    return offset;
  }

  protected _appendBuffer(buf: DataBuffer) {
    this._bufs.push(buf);
    this.length += buf.length;
  }

  // Used internally by the class and also as an indicator of this object being
  // a `BufferList`. It's not possible to use `instanceof BufferList` in a browser

  // environment because there could be multiple different copies of the
  protected _match(offset: number, search: DataBuffer) {
    if (this.length - offset < search.length) {
      return false;
    }

    for (let searchOffset = 0; searchOffset < search.length; searchOffset++) {
      if (this.get(offset + searchOffset) !== search.buffer[searchOffset]) {
        return false;
      }
    }
    return true;
  }

  // BufferList class and some `BufferList`s might be `BufferList`s.
  protected _isBufferList(b: any): b is BufferList {
    return b instanceof BufferList || BufferList.isBufferList(b);
  }
}

(function () {
  const methods: Record<string, number | null> = {
    // readDoubleBE: 8,
    // readDoubleLE: 8,
    // readFloatBE: 4,
    // readFloatLE: 4,
    // readInt32BE: 4,
    // readInt32LE: 4,
    readUInt32BE: 4,
    readUInt32LE: 4,
    // readInt16BE: 2,
    // readInt16LE: 2,
    readUInt16BE: 2,
    readUInt16LE: 2,
    // readInt8: 1,
    readUInt8: 1,
    // readIntBE: null,
    // readIntLE: null,
    // readUIntBE: null,
    // readUIntLE: null
  };

  for (const m in methods) {
    // (function (m) {
    const proto = BufferList.prototype as any;
    if (methods[m] == null) {
      proto[m] = function (this: BufferList, offset: number, byteLength: number) {
        return (this.slice(offset, offset + byteLength) as any)[m](0, byteLength);
      };
    } else {
      proto[m] = function (this: BufferList, offset = 0) {
        return (this.slice(offset, offset + methods[m]!) as any)[m](0);
      };
    }
    // }(m))
  }
})();
