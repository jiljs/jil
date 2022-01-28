import {random} from '../../../random';
import {base32} from '../../../encoding';

// https://tools.ietf.org/html/rfc4648#section-10
const vectors = [
  ['', ''],
  ['f', 'my======'],
  ['fo', 'mzxq===='],
  ['foo', 'mzxw6==='],
  ['foob', 'mzxw6yq='],
  ['fooba', 'mzxw6ytb'],
  ['foobar', 'mzxw6ytboi======'],
];

const vectorsHex = [
  ['', ''],
  ['f', 'co======'],
  ['fo', 'cpng===='],
  ['foo', 'cpnmu==='],
  ['foob', 'cpnmuog='],
  ['fooba', 'cpnmuoj1'],
  ['foobar', 'cpnmuoj1e8======'],
];

describe('Base32', function () {
  for (const [str, b32] of vectors) {
    const data = Buffer.from(str, 'binary');

    it(`should encode and decode base32: ${str}: ${b32}`, () => {
      expect(base32.encode(data, true)).toBe(b32);
      expect(base32.encode(data, false)).toEqual(b32.replace(/=+$/, ''));
      expect(base32.decode(b32, true)).toEqual(data);
      expect(base32.decode(b32.replace(/=+$/, ''), false)).toEqual(data);
      expect(base32.test(b32, true)).toBe(true);
      expect(base32.test(b32.replace(/=+$/, ''), false)).toBeTruthy();
    });
  }

  for (const [str, b32] of vectorsHex) {
    const data = Buffer.from(str, 'binary');

    it(`should encode and decode base32: ${str}: ${b32}`, () => {
      expect(base32.encodeHex(data, true)).toBe(b32);
      expect(base32.encodeHex(data, false)).toEqual(b32.replace(/=+$/, ''));
      expect(base32.decodeHex(b32, true)).toEqual(data);
      expect(base32.decodeHex(b32.replace(/=+$/, ''), false)).toEqual(data);
      expect(base32.testHex(b32, true)).toBe(true);
      expect(base32.testHex(b32.replace(/=+$/, ''), false)).toBeTruthy();
    });
  }

  it('should encode/decode random data', () => {
    for (let i = 0; i < 128; i++) {
      const data = random.randomBytes(i);
      const str1 = base32.encode(data, false);
      const dec1 = base32.decode(str1, false);
      const str2 = base32.encode(data, true);
      const dec2 = base32.decode(str2, true);

      expect(base32.test(str1, false)).toBeTruthy();
      expect(base32.test(str2, true)).toBeTruthy();

      expect(dec1).toEqual(data);
      expect(dec2).toEqual(data);
    }
  });
});
