import {encoding} from '..';

const unsigned: [number, boolean, number, string][] = [
  [32, false, 4293853166, 'eeffeeff00000000'],
  [53, false, 9007126239182830, 'eeffeeffeeff1f00'],
  [32, false, 4009750271, 'ffeeffee00000000'],
  [53, false, 8988507271851775, 'ffeeffeeffee1f00'],
  [0, false, 0, '0000000000000000'],
  [1, false, 1, '0100000000000000'],
];

const signed: [number, boolean, number, string][] = [
  [32, false, 4293853166, 'eeffeeff00000000'],
  [53, false, 9007126239182830, 'eeffeeffeeff1f00'],
  [32, false, 4009750271, 'ffeeffee00000000'],
  [53, false, 8988507271851775, 'ffeeffeeffee1f00'],
  [0, false, 0, '0000000000000000'],
  [1, false, 1, '0100000000000000'],
  [32, true, -4293853166, '12001100ffffffff'],
  [53, true, -9007126239182830, '120011001100e0ff'],
  [32, true, -4009750271, '01110011ffffffff'],
  [53, true, -8988507271851775, '011100110011e0ff'],
  [0, false, 0, '0000000000000000'],
  [1, true, -1, 'ffffffffffffffff'],
];

describe('bufio', function () {
  it('should write/read new varints', () => {
    /*
     * 0:         [0x00]  256:        [0x81 0x00]
     * 1:         [0x01]  16383:      [0xFE 0x7F]
     * 127:       [0x7F]  16384:      [0xFF 0x00]
     * 128:  [0x80 0x00]  16511: [0x80 0xFF 0x7F]
     * 255:  [0x80 0x7F]  65535: [0x82 0xFD 0x7F]
     * 2^32:           [0x8E 0xFE 0xFE 0xFF 0x00]
     */

    let b = Buffer.alloc(1, 0xff);
    encoding.writeVarint2(b, 0, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(0);
    expect(b).toEqual(Buffer.from([0]));

    b = Buffer.alloc(1, 0xff);
    encoding.writeVarint2(b, 1, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(1);
    expect(b).toEqual(Buffer.from([1]));

    b = Buffer.alloc(1, 0xff);
    encoding.writeVarint2(b, 127, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(127);
    expect(b).toEqual(Buffer.from([0x7f]));

    b = Buffer.alloc(2, 0xff);
    encoding.writeVarint2(b, 128, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(128);
    expect(b).toEqual(Buffer.from([0x80, 0x00]));

    b = Buffer.alloc(2, 0xff);
    encoding.writeVarint2(b, 255, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(255);
    expect(b).toEqual(Buffer.from([0x80, 0x7f]));

    b = Buffer.alloc(2, 0xff);
    encoding.writeVarint2(b, 16383, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(16383);
    expect(b).toEqual(Buffer.from([0xfe, 0x7f]));

    b = Buffer.alloc(2, 0xff);
    encoding.writeVarint2(b, 16384, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(16384);
    expect(b).toEqual(Buffer.from([0xff, 0x00]));

    b = Buffer.alloc(3, 0xff);
    encoding.writeVarint2(b, 16511, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(16511);
    expect(b.slice(0, 2)).toEqual(Buffer.from([0xff, 0x7f]));
    // expect(b).toEqual(Buffer.from([0x80, 0xff, 0x7f]));

    b = Buffer.alloc(3, 0xff);
    encoding.writeVarint2(b, 65535, 0);
    expect(encoding.readVarint2(b, 0).value).toBe(65535);
    expect(b).toEqual(Buffer.from([0x82, 0xfe, 0x7f]));
    // expect(b).toEqual(Buffer.from([0x82, 0xfd, 0x7f]));

    b = Buffer.alloc(5, 0xff);
    encoding.writeVarint2(b, Math.pow(2, 32), 0);
    expect(encoding.readVarint2(b, 0).value).toBe(Math.pow(2, 32));
    expect(b).toEqual(Buffer.from([0x8e, 0xfe, 0xfe, 0xff, 0x00]));
  });

  for (const [bits, , num] of unsigned) {
    it(`should write+read a ${bits} bit unsigned int`, () => {
      const buf2 = Buffer.allocUnsafe(8);

      encoding.writeU64(buf2, num, 0);

      const n2 = encoding.readU64(buf2, 0);

      expect(num).toBe(n2);
    });
  }

  for (const [bits, neg, num] of signed) {
    const sign = neg ? 'negative' : 'positive';

    it(`should write+read a ${bits} bit ${sign} int`, () => {
      const buf2 = Buffer.allocUnsafe(8);

      encoding.writeI64(buf2, num, 0);

      const n2 = encoding.readI64(buf2, 0);

      expect(num).toBe(n2);
    });

    it(`should write+read a ${bits} bit ${sign} int as unsigned`, () => {
      const buf2 = Buffer.allocUnsafe(8);

      encoding.writeU64(buf2, num, 0);

      if (neg) {
        expect(() => encoding.readU64(buf2, 0)).toThrow();
      } else {
        const n2 = encoding.readU64(buf2, 0);
        expect(num).toBe(n2);
      }
    });
  }
});
