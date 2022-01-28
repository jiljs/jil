import {HashLike} from './types';

export interface Writer {
  /**
   * Allocate and render the final buffer.
   * @returns {Buffer} Rendered buffer.
   */

  render(): Buffer;

  /**
   * Get size of data written so far.
   * @returns {Number}
   */

  getSize(): number;

  /**
   * Seek to relative offset.
   */

  seek(off: number): this;

  /**
   * Destroy the buffer writer. Remove references to `ops`.
   */

  destroy(): this;

  /**
   * Write uint8.
   * @param {Number} value
   */

  writeU8(value: number): this;

  /**
   * Write uint16le.
   * @param {Number} value
   */

  writeU16(value: number): this;

  /**
   * Write uint16be.
   * @param {Number} value
   */

  writeU16BE(value: number): this;

  /**
   * Write uint24le.
   * @param {Number} value
   */

  writeU24(value: number): this;

  /**
   * Write uint24be.
   * @param {Number} value
   */

  writeU24BE(value: number): this;

  /**
   * Write uint32le.
   * @param {Number} value
   */

  writeU32(value: number): this;

  /**
   * Write uint32be.
   * @param {Number} value
   */

  writeU32BE(value: number): this;

  /**
   * Write uint40le.
   * @param {Number} value
   */

  writeU40(value: number): this;

  /**
   * Write uint40be.
   * @param {Number} value
   */

  writeU40BE(value: number): this;

  /**
   * Write uint48le.
   * @param {Number} value
   */

  writeU48(value: number): this;

  /**
   * Write uint48be.
   * @param {Number} value
   */

  writeU48BE(value: number): this;

  /**
   * Write uint56le.
   * @param {Number} value
   */

  writeU56(value: number): this;

  /**
   * Write uint56be.
   * @param {Number} value
   */

  writeU56BE(value: number): this;

  /**
   * Write uint64le.
   * @param {Number} value
   */

  writeU64(value: number): this;

  /**
   * Write uint64be.
   * @param {Number} value
   */

  writeU64BE(value: number): this;

  /**
   * Write int8.
   * @param {Number} value
   */

  writeI8(value: number): this;

  /**
   * Write int16le.
   * @param {Number} value
   */

  writeI16(value: number): this;

  /**
   * Write int16be.
   * @param {Number} value
   */

  writeI16BE(value: number): this;

  /**
   * Write int24le.
   * @param {Number} value
   */

  writeI24(value: number): this;

  /**
   * Write int24be.
   * @param {Number} value
   */

  writeI24BE(value: number): this;

  /**
   * Write int32le.
   * @param {Number} value
   */

  writeI32(value: number): this;

  /**
   * Write int32be.
   * @param {Number} value
   */

  writeI32BE(value: number): this;

  /**
   * Write int40le.
   * @param {Number} value
   */

  writeI40(value: number): this;

  /**
   * Write int40be.
   * @param {Number} value
   */

  writeI40BE(value: number): this;

  /**
   * Write int48le.
   * @param {Number} value
   */

  writeI48(value: number): this;

  /**
   * Write int48be.
   * @param {Number} value
   */

  writeI48BE(value: number): this;

  /**
   * Write int56le.
   * @param {Number} value
   */

  writeI56(value: number): this;

  /**
   * Write int56be.
   * @param {Number} value
   */

  writeI56BE(value: number): this;

  /**
   * Write int64le.
   * @param {Number} value
   */

  writeI64(value: number): this;

  /**
   * Write int64be.
   * @param {Number} value
   */

  writeI64BE(value: number): this;

  /**
   * Write float le.
   * @param {Number} value
   */

  writeFloat(value: number): this;

  /**
   * Write float be.
   * @param {Number} value
   */

  writeFloatBE(value: number): this;

  /**
   * Write double le.
   * @param {Number} value
   */

  writeDouble(value: number): this;

  /**
   * Write double be.
   * @param {Number} value
   */

  writeDoubleBE(value: number): this;

  /**
   * Write a varint.
   * @param {Number} value
   */

  writeVarint(value: number): this;

  /**
   * Write a varint (type 2).
   * @param {Number} value
   */

  writeVarint2(value: number): this;

  /**
   * Write bytes.
   * @param {Buffer} value
   */

  writeBytes(value: Buffer): this;

  /**
   * Write bytes with a varint length before them.
   * @param {Buffer} value
   */

  writeVarBytes(value: Buffer): this;

  /**
   * Copy bytes.
   * @param {Buffer} value
   * @param {Number} start
   * @param {Number} end
   */

  copy(value: Buffer, start: number, end: number): this;

  /**
   * Write string to buffer.
   * @param {String} value
   * @param {String?} enc - Any buffer-supported encoding.
   */

  writeString(value: string, enc?: BufferEncoding): this;

  /**
   * Write a 32 byte hash.
   * @param {Hash} value
   */

  writeHash(value: Buffer | string): this;

  /**
   * Write a string with a varint length before it.
   */

  writeVarString(value: string, enc?: BufferEncoding): this;

  /**
   * Write a null-terminated string.
   */

  writeNullString(value: string | Buffer, enc?: BufferEncoding): this;

  /**
   * Calculate and write a checksum for the data written so far.
   * @param {Function} hash
   */

  writeChecksum(hash: HashLike): this;

  /**
   * Fill N bytes with value.
   * @param {Number} value
   * @param {Number} size
   */

  fill(value: number, size: number): this;
}
