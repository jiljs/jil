import {random} from '../../../random';
import {base64} from '../../../encoding';

// https://tools.ietf.org/html/rfc4648#section-10
const vectors = [
  ['', ''],
  ['66', 'Zg=='],
  ['666f', 'Zm8='],
  ['666f6f', 'Zm9v'],
  ['666f6f62', 'Zm9vYg=='],
  ['666f6f6261', 'Zm9vYmE='],
  ['666f6f626172', 'Zm9vYmFy'],
  ['53e9363b2962fcaf', 'U+k2Oyli/K8='],
];

const invalid = [' Zg==', 'Zg== ', 'Z g==', 'Zg ==', 'Zg', 'Zm8', 'Zm9vYg', 'Zm9vYmE', 'U-k2Oyli_K8'];

const urlVectors = [
  ['', ''],
  ['66', 'Zg'],
  ['666f', 'Zm8'],
  ['666f6f', 'Zm9v'],
  ['666f6f62', 'Zm9vYg'],
  ['666f6f6261', 'Zm9vYmE'],
  ['666f6f626172', 'Zm9vYmFy'],
  ['53e9363b2962fcaf', 'U-k2Oyli_K8'],
];

const urlInvalid = ['Zg==', 'Zm8=', 'Zm9vYg==', 'Zm9vYmE=', 'U+k2Oyli/K8='];

describe('Base64', function () {
  for (const [hex, b64] of vectors) {
    const data = Buffer.from(hex, 'hex');

    it(`should encode and decode base64: ${b64}`, () => {
      expect(base64.test(b64)).toBe(true);
      expect(base64.encode(data)).toBe(b64);
      expect(base64.decode(b64)).toEqual(data);
    });
  }

  for (const b64 of invalid) {
    it(`should recognize invalid base64: ${b64}`, () => {
      expect(base64.test(b64)).toBe(false);
      expect(() => base64.decode(b64)).toThrow();
    });
  }

  for (const [hex, b64] of urlVectors) {
    const data = Buffer.from(hex, 'hex');

    it(`should encode and decode base64-url: ${b64}`, () => {
      expect(base64.testURL(b64)).toBe(true);
      expect(base64.encodeURL(data)).toBe(b64);
      expect(base64.decodeURL(b64)).toEqual(data);
    });
  }

  for (const b64 of urlInvalid) {
    it(`should recognize invalid base64-url: ${b64}`, () => {
      expect(base64.testURL(b64)).toBe(false);
      expect(() => base64.decodeURL(b64)).toThrow();
    });
  }

  it('should encode/decode random data', () => {
    for (let i = 0; i < 128; i++) {
      const data = random.randomBytes(i);
      const str1 = base64.encode(data);
      const dec1 = base64.decode(str1);
      const str2 = base64.encodeURL(data);
      const dec2 = base64.decodeURL(str2);

      expect(base64.test(str1)).toBeTruthy();
      expect(base64.testURL(str2)).toBeTruthy();

      expect(str1).toEqual(data.toString('base64'));
      expect(str2).toEqual(data.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));

      expect(dec1).toEqual(data);
      expect(dec2).toEqual(data);
    }
  });
});
