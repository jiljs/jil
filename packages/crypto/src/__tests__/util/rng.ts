import {assert} from '../../internal/assert';
import {SHA256} from '../../sha256';
import {Curve} from '../../types';

// Super dumb deterministic RNG.
export class RNG {
  prev: Buffer;

  constructor() {
    this.prev = Buffer.alloc(32, 0x00);
  }

  randomBytes(len: number) {
    expect(len >>> 0 === len).toBeTruthy();

    const out = Buffer.alloc(len);

    let pos = 0;

    while (pos < len) {
      this.prev = SHA256.digest(this.prev);
      pos += this.prev.copy(out, pos);
    }

    return out;
  }

  randomInt() {
    return this.randomBytes(4).readUInt32LE(0);
  }

  randomRange(min: number, max: number) {
    expect(min >>> 0 === min).toBeTruthy();
    expect(max >>> 0 === max).toBeTruthy();
    expect(max >= min).toBeTruthy();

    const space = max - min;

    if (space === 0) return min;

    return (this.randomInt() % space) + min;
  }

  privateKeyGenerate(curve: Curve) {
    assert(curve && typeof curve.id === 'string');
    expect(curve.size >>> 0 === curve.size).toBeTruthy();
    assert(typeof curve.privateKeyGenerate === 'function');

    if (curve.type === 'ecdsa') {
      let key: Buffer;

      do {
        key = this.randomBytes(curve.size);
      } while (!curve.privateKeyVerify!(key));

      return key;
    }

    return this.randomBytes(curve.size);
  }

  scalarGenerate(curve: Curve) {
    assert(curve && typeof curve.id === 'string');
    expect(curve.bits >>> 0 === curve.bits).toBeTruthy();
    assert(typeof curve.scalarGenerate === 'function');

    const key = this.randomBytes((curve.bits + 7) >>> 3);

    return curve.scalarClamp!(key);
  }
}
