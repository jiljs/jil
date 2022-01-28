import {random} from '../../../random';
import {base58, cash32} from '../../../encoding';

const vectors = {
  translation: require('../../data/cash32/translation.json'),
  size: require('../../data/cash32/size.json'),
  encode: require('../../data/cash32/encode.json'),
  decode: require('../../data/cash32/decode.json'),
  edge: require('../../data/cash32/edge.json'),
};

function encodeManual(prefix: string, type: number, hash: Buffer) {
  expect(typeof prefix).toEqual('string');
  expect(type >>> 0 === type).toBeTruthy();
  expect(Buffer.isBuffer(hash)).toBeTruthy();

  if (type > 15) throw new Error('Invalid cash32 type.');

  let size;

  switch (hash.length) {
    case 20:
      size = 0;
      break;
    case 24:
      size = 1;
      break;
    case 28:
      size = 2;
      break;
    case 32:
      size = 3;
      break;
    case 40:
      size = 4;
      break;
    case 48:
      size = 5;
      break;
    case 56:
      size = 6;
      break;
    case 64:
      size = 7;
      break;
    default:
      throw new Error('Non standard length.');
  }

  const data = Buffer.alloc(hash.length + 1);

  data[0] = (type << 3) | size;

  hash.copy(data, 1);

  const conv = cash32.convertBits(data, 8, 5, true);

  return cash32.serialize(prefix, conv);
}

function decodeManual(addr: string, expect = 'bitcoincash'): [number, Buffer] {
  const [prefix, conv] = cash32.deserialize(addr, expect);

  if (prefix !== expect) throw new Error('Invalid cash32 prefix.');

  if (conv.length === 0 || conv.length > 104) throw new Error('Invalid cash32 data.');

  const data = cash32.convertBits(conv, 5, 8, false);

  if (data.length === 0 || data.length > 1 + 64) throw new Error('Invalid cash32 data.');

  const type = (data[0] >>> 3) & 0x1f;
  const hash = data.slice(1);

  let size = 20 + 4 * (data[0] & 0x03);

  if (data[0] & 0x04) size *= 2;

  if (type > 15) throw new Error('Invalid cash32 type.');

  if (size !== hash.length) throw new Error('Invalid cash32 data length.');

  return [type, hash];
}

describe('Cash32', function () {
  describe('Encoding', () => {
    for (const vector of vectors.size) {
      const text = vector.addr.slice(0, 32) + '...';

      it(`should encode address ${text} (${vector.bytes} bytes)`, () => {
        const addr = cash32.encode(vector.prefix, vector.type, Buffer.from(vector.hash, 'hex'));

        expect(addr).toEqual(vector.addr);
      });

      it(`should decode address ${text} (${vector.bytes} bytes)`, () => {
        const [type, hash] = cash32.decode(vector.addr, vector.prefix);

        expect(cash32.test(vector.addr, vector.prefix)).toBe(true);
        expect(cash32.is(vector.addr, vector.prefix)).toBe(true);
        expect(type).toEqual(vector.type);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });
    }
  });

  describe('Encoding (Manual)', () => {
    for (const vector of vectors.size) {
      const text = vector.addr.slice(0, 32) + '...';

      it(`should encode address ${text} (${vector.bytes} bytes)`, () => {
        const addr = encodeManual(vector.prefix, vector.type, Buffer.from(vector.hash, 'hex'));

        expect(addr).toEqual(vector.addr);
      });

      it(`should decode address ${text} (${vector.bytes} bytes)`, () => {
        const [type, hash] = decodeManual(vector.addr, vector.prefix);

        expect(cash32.test(vector.addr, vector.prefix)).toBe(true);
        expect(cash32.is(vector.addr, vector.prefix)).toBe(true);
        expect(type).toEqual(vector.type);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });
    }
  });

  describe('Translation', () => {
    for (const translation of vectors.translation.p2pkh) {
      const text = translation.legacy.slice(0, 32) + '...';

      it(`should translate base58 P2PKH for ${text}`, () => {
        const hash = base58.decode(translation.legacy).slice(1, -4);
        const addr = cash32.encode('bitcoincash', 0, hash);

        expect(addr).toEqual(translation.address);
      });
    }

    for (const translation of vectors.translation.p2sh) {
      const text = translation.legacy.slice(0, 32) + '...';

      it(`should translate base58 P2SH for ${text}`, () => {
        const hash = base58.decode(translation.legacy).slice(1, -4);
        const addr = cash32.encode('bitcoincash', 1, hash);

        expect(addr).toEqual(translation.address);
      });
    }

    for (const vector of vectors.translation.p2pkh) {
      const text = vector.address.slice(0, 32) + '...';

      it(`should decode P2PKH for ${text}`, () => {
        const [type, hash] = cash32.decode(vector.address);

        expect(type).toBe(0);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });

      it(`should encode P2PKH for ${text}`, () => {
        const addr = cash32.encode('bitcoincash', 0, Buffer.from(vector.hash, 'hex'));

        expect(addr).toEqual(vector.address);
      });
    }

    for (const vector of vectors.translation.p2sh) {
      const text = vector.address.slice(0, 32) + '...';

      it(`should decode P2SH for ${text}`, () => {
        const [type, hash] = cash32.decode(vector.address);

        expect(type).toBe(1);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });

      it(`should encode P2SH for ${text}`, () => {
        const addr = cash32.encode('bitcoincash', 1, Buffer.from(vector.hash, 'hex'));

        expect(addr).toEqual(vector.address);
      });
    }

    for (const vector of vectors.translation.p2pkh) {
      const text = vector.address.slice(0, 32) + '...';

      it(`should decode P2PKH with prefix ${text}`, () => {
        const addr = vector.address.split(':')[1];
        const [type, hash] = cash32.decode(addr, 'bitcoincash');

        expect(type).toBe(0);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });

      it(`should decode P2PKH with default prefix ${text}`, () => {
        const addr = vector.address.split(':')[1];
        const [type, hash] = cash32.decode(addr);

        expect(type).toBe(0);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });
    }

    for (const vector of vectors.translation.p2sh) {
      const text = vector.address.slice(0, 32) + '...';

      it(`should decode P2SH with prefix ${text}`, () => {
        const addr = vector.address.split(':')[1];
        const [type, hash] = cash32.decode(addr, 'bitcoincash');

        expect(type).toBe(1);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });

      it(`should decode P2SH with default prefix ${text}`, () => {
        const addr = vector.address.split(':')[1];
        const [type, hash] = cash32.decode(addr);

        expect(type).toBe(1);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });
    }
  });

  describe('Invalid Encoding', () => {
    for (const vector of vectors.encode) {
      it(`"${vector.reason}" (${vector.note})`, () => {
        expect(() => cash32.encode(vector.prefix, vector.type, Buffer.from(vector.hash, 'hex'))).toThrow();
      });
    }
  });

  describe('Invalid Decoding', () => {
    for (const vector of vectors.decode) {
      const text = vector.addr.slice(0, 32) + '...';

      it(`"${vector.reason}" w/ invalid address ${text}`, () => {
        expect(() => cash32.decode(vector.addr, vector.prefix)).toThrow();
      });
    }
  });

  describe('Edge Cases', () => {
    for (const vector of vectors.edge) {
      const text = vector.addr.slice(0, 32) + '...';

      it(`encode ${vector.note} with address: ${text}`, () => {
        const addr = cash32.encode(vector.prefix.toLowerCase(), vector.type, Buffer.from(vector.hash, 'hex'));
        expect(addr).toEqual(vector.addr.toLowerCase());
      });

      it(`decode ${vector.note} with address: ${text}`, () => {
        const [type, hash] = cash32.decode(vector.addr, vector.prefix.toLowerCase());

        expect(type).toEqual(vector.type);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });

      it(`round trip ${vector.note} with address: ${text}`, () => {
        const addr = cash32.encode(vector.prefix.toLowerCase(), vector.type, Buffer.from(vector.hash, 'hex'));

        expect(addr).toEqual(vector.addr.toLowerCase());

        const [type, hash] = cash32.decode(vector.addr, vector.prefix.toLowerCase());

        expect(type).toEqual(vector.type);
        expect(hash).toEqual(Buffer.from(vector.hash, 'hex'));
      });
    }
  });

  describe('Random', () => {
    it('should encode/decode random data', () => {
      for (let i = 20; i <= 64; i++) {
        const data = random.randomBytes(i);
        const converted = cash32.convertBits(data, 8, 5, true);
        const str = cash32.serialize('prefix', converted);
        const [prefix, deserialized] = cash32.deserialize(str, 'prefix');
        const dec = cash32.convertBits(deserialized, 5, 8, false);

        expect(cash32.is(str, 'prefix')).toBeTruthy();

        expect(prefix).toEqual('prefix');
        expect(dec).toEqual(data);
      }
    });

    it('should encode/decode random addresses', () => {
      for (const size of [20, 28, 32, 48, 64]) {
        const hash = random.randomBytes(size);
        const type = random.randomRange(0, 16);
        const addr = cash32.encode('bitcoincash', type, hash);
        const [decodedType, decodedHash] = cash32.decode(addr);

        expect(decodedType).toEqual(type);
        expect(decodedHash).toEqual(hash);
      }
    });
  });
});
