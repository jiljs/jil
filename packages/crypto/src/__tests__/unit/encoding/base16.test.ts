import {random} from '../../../random';
import {base16} from '../../../encoding';

// https://tools.ietf.org/html/rfc4648#section-10
const vectors = [
  ['', ''],
  ['f', '66'],
  ['fo', '666f'],
  ['foo', '666f6f'],
  ['foob', '666f6f62'],
  ['fooba', '666f6f6261'],
  ['foobar', '666f6f626172'],
];

const vectorsLE = [
  ['', ''],
  ['f', '66'],
  ['fo', '6f66'],
  ['foo', '6f6f66'],
  ['foob', '626f6f66'],
  ['fooba', '61626f6f66'],
  ['foobar', '7261626f6f66'],
];

const invalid = ['6', '6x', 'x6', '66 ', ' 66', '666fxa'];

describe('Base16', function () {
  for (const [str, hex] of vectors) {
    const data = Buffer.from(str, 'binary');

    it(`should encode and decode base16: ${hex}`, () => {
      expect(base16.test(hex)).toBe(true);
      expect(base16.test(hex.toUpperCase())).toBe(true);
      expect(base16.encode(data)).toBe(hex);
      expect(base16.decode(hex)).toEqual(data);
      expect(base16.decode(hex.toUpperCase())).toEqual(data);
    });
  }

  for (const [str, hex] of vectorsLE) {
    const data = Buffer.from(str, 'binary');

    it(`should encode and decode base16 (LE): ${hex}`, () => {
      expect(base16.encodeLE(data)).toBe(hex);
      expect(base16.decodeLE(hex)).toEqual(data);
      expect(base16.decodeLE(hex.toUpperCase())).toEqual(data);
    });
  }

  for (const hex of invalid) {
    it(`should recognize invalid base16: ${hex}`, () => {
      expect(base16.test(hex)).toBe(false);
      expect(base16.test(hex.toUpperCase())).toBe(false);
      expect(() => base16.decode(hex)).toThrow();
      expect(() => base16.decode(hex.toUpperCase())).toThrow();
      expect(() => base16.decodeLE(hex)).toThrow();
      expect(() => base16.decodeLE(hex.toUpperCase())).toThrow();
    });
  }

  it('should encode/decode random data', () => {
    for (let i = 0; i < 128; i++) {
      const data = random.randomBytes(i);
      const str = base16.encode(data);
      const dec = base16.decode(str);

      expect(base16.test(str)).toBeTruthy();

      expect(str).toEqual(data.toString('hex'));
      expect(dec).toEqual(data);
    }
  });
});
