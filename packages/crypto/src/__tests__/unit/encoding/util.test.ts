import {BN} from '../../../bn';
import {random} from '../../../random';
import {util} from '../../../encoding';

const EMPTY = Buffer.alloc(0);

const {countLeft, countRight, compareLeft, compareRight, trimLeft, trimRight, padLeft, padRight} = util;

describe('Util', function () {
  it('should count bits (BE)', () => {
    const a = Buffer.from('dde5180064264fb915227539ab9173d2077a2896', 'hex');
    const b = Buffer.from('0b8d6ee639d0be56e0ed9249cc606cc246802ed3', 'hex');
    const c = Buffer.from('0000069f1d5a50bfeb63de5022d1a2d69eee3ba8', 'hex');

    expect(countLeft(Buffer.alloc(0, 0x00))).toBe(0);
    expect(countLeft(Buffer.alloc(32, 0x00))).toBe(0);
    expect(countLeft(Buffer.alloc(32, 0xaa))).toBe(256);
    expect(countLeft(a)).toBe(160);
    expect(countLeft(b)).toBe(156);
    expect(countLeft(c)).toBe(139);
  });

  it('should count bits (LE)', () => {
    const a = Buffer.from('6c5034a300ae5955cff22b79f37e86bbc811b367', 'hex');
    const b = Buffer.from('638b076c969f0b2ed7c90d031dbbbe23e2806d60', 'hex');
    const c = Buffer.from('55ab1c1cc05672e13d4141f65c84227a39000000', 'hex');

    expect(countRight(Buffer.alloc(0, 0x00))).toBe(0);
    expect(countRight(Buffer.alloc(32, 0x00))).toBe(0);
    expect(countRight(Buffer.alloc(32, 0xaa))).toBe(256);
    expect(countRight(a)).toBe(159);
    expect(countRight(b)).toBe(159);
    expect(countRight(c)).toBe(134);
  });

  it('should compare buffers (BE)', () => {
    const a = Buffer.from('dde5180064264fb915227539ab9173d2077a2896', 'hex');
    const b = Buffer.from('0b8d6ee639d0be56e0ed9249cc606cc246802ed3', 'hex');
    const c = Buffer.from('0000069f1d5a50bfeb63de5022d1a2d69eee3ba8', 'hex');

    expect(compareLeft(a, b) > 0).toBeTruthy();
    expect(compareLeft(b, a) < 0).toBeTruthy();
    expect(compareLeft(a, c) > 0).toBeTruthy();
    expect(compareLeft(c, a) < 0).toBeTruthy();
    expect(compareLeft(b, c) > 0).toBeTruthy();
    expect(compareLeft(c, b) < 0).toBeTruthy();
    expect(compareLeft(a, a) === 0).toBeTruthy();
    expect(compareLeft(b, b) === 0).toBeTruthy();
    expect(compareLeft(c, c) === 0).toBeTruthy();
  });

  it('should compare buffers (LE)', () => {
    const a = Buffer.from('6c5034a300ae5955cff22b79f37e86bbc811b367', 'hex');
    const b = Buffer.from('638b076c969f0b2ed7c90d031dbbbe23e2806d60', 'hex');
    const c = Buffer.from('55ab1c1cc05672e13d4141f65c84227a39000000', 'hex');

    expect(compareRight(a, b) > 0).toBeTruthy();
    expect(compareRight(b, a) < 0).toBeTruthy();
    expect(compareRight(a, c) > 0).toBeTruthy();
    expect(compareRight(c, a) < 0).toBeTruthy();
    expect(compareRight(b, c) > 0).toBeTruthy();
    expect(compareRight(c, b) < 0).toBeTruthy();
    expect(compareRight(a, a) === 0).toBeTruthy();
    expect(compareRight(b, b) === 0).toBeTruthy();
    expect(compareRight(c, c) === 0).toBeTruthy();
  });

  it('should compare buffers of different lengths (BE)', () => {
    const a = Buffer.from('dde5180064264fb915227539ab9173d2077a2896', 'hex');
    const b = Buffer.from('8d6ee639d0be56e0ed9249cc606cc246802ed3', 'hex');
    const c = Buffer.from('069f1d5a50bfeb63de5022d1a2d69eee3ba8', 'hex');

    expect(compareLeft(a, b) > 0).toBeTruthy();
    expect(compareLeft(b, a) < 0).toBeTruthy();
    expect(compareLeft(a, c) > 0).toBeTruthy();
    expect(compareLeft(c, a) < 0).toBeTruthy();
    expect(compareLeft(b, c) > 0).toBeTruthy();
    expect(compareLeft(c, b) < 0).toBeTruthy();
    expect(compareLeft(a, a) === 0).toBeTruthy();
    expect(compareLeft(b, b) === 0).toBeTruthy();
    expect(compareLeft(c, c) === 0).toBeTruthy();
  });

  it('should compare buffers of different lengths (LE)', () => {
    const a = Buffer.from('6c5034a300ae5955cff22b79f37e86bbc811b367', 'hex');
    const b = Buffer.from('638b076c969f0b2ed7c90d031dbbbe23e2806d', 'hex');
    const c = Buffer.from('55ab1c1cc05672e13d4141f65c84227a39', 'hex');

    expect(compareRight(a, b) > 0).toBeTruthy();
    expect(compareRight(b, a) < 0).toBeTruthy();
    expect(compareRight(a, c) > 0).toBeTruthy();
    expect(compareRight(c, a) < 0).toBeTruthy();
    expect(compareRight(b, c) > 0).toBeTruthy();
    expect(compareRight(c, b) < 0).toBeTruthy();
    expect(compareRight(a, a) === 0).toBeTruthy();
    expect(compareRight(b, b) === 0).toBeTruthy();
    expect(compareRight(c, c) === 0).toBeTruthy();
  });

  it('should recognize equal buffers (BE)', () => {
    const a = Buffer.from('e5180064264fb915227539ab9173d2077a2896', 'hex');
    const b = Buffer.from('0000e5180064264fb915227539ab9173d2077a2896', 'hex');

    expect(compareLeft(a, b) === 0).toBeTruthy();
    expect(compareLeft(b, a) === 0).toBeTruthy();
  });

  it('should recognize equal buffers (LE)', () => {
    const a = Buffer.from('34a300ae5955cff22b79f37e86bbc811b367', 'hex');
    const b = Buffer.from('34a300ae5955cff22b79f37e86bbc811b3670000', 'hex');

    expect(compareRight(a, b) === 0).toBeTruthy();
    expect(compareRight(b, a) === 0).toBeTruthy();
  });

  it('should trim buffers (BE)', () => {
    const a = Buffer.from('0000e5180064264fb915227539ab9173d2077a2896', 'hex');
    const b = Buffer.from('e5180064264fb915227539ab9173d2077a2896', 'hex');

    expect(trimLeft(Buffer.alloc(32, 0x00))).toEqual(EMPTY);
    expect(trimLeft(Buffer.alloc(0))).toEqual(EMPTY);
    expect(trimLeft(a)).toEqual(b);
  });

  it('should trim buffers (LE)', () => {
    const a = Buffer.from('34a300ae5955cff22b79f37e86bbc811b3670000', 'hex');
    const b = Buffer.from('34a300ae5955cff22b79f37e86bbc811b367', 'hex');

    expect(trimRight(Buffer.alloc(32, 0x00))).toEqual(EMPTY);
    expect(trimRight(Buffer.alloc(0))).toEqual(EMPTY);
    expect(trimRight(a)).toEqual(b);
  });

  it('should pad buffers (BE)', () => {
    const a = Buffer.from('0000e5180064264fb915227539ab9173d2077a2896', 'hex');
    const b = Buffer.from('e5180064264fb915227539ab9173d2077a2896', 'hex');

    expect(padLeft(b, a.length)).toEqual(a);
    expect(padLeft(a, b.length)).toEqual(b);
    expect(() => padLeft(a, b.length - 1)).toThrow();
  });

  it('should pad buffers (LE)', () => {
    const a = Buffer.from('34a300ae5955cff22b79f37e86bbc811b3670000', 'hex');
    const b = Buffer.from('34a300ae5955cff22b79f37e86bbc811b367', 'hex');

    expect(padRight(b, a.length)).toEqual(a);
    expect(padRight(a, b.length)).toEqual(b);
    expect(() => padRight(a, b.length - 1)).toThrow();
  });

  it('should do randomized tests (BE)', () => {
    for (let i = 0; i < 128; i++) {
      const off = i > 0 && (i & 3) === 0 ? 1 : 0;
      const a = random.randomBytes(i);
      const b = random.randomBytes(i - off);
      const x = BN.decode(a, 'be');
      const y = BN.decode(b, 'be');

      expect(countLeft(a)).toEqual(x.bitLength());
      expect(countLeft(b)).toEqual(y.bitLength());

      expect(compareLeft(a, b)).toEqual(x.cmp(y));
      expect(compareLeft(b, a)).toEqual(y.cmp(x));
      expect(compareLeft(a, a)).toEqual(x.cmp(x));
      expect(compareLeft(b, b)).toEqual(y.cmp(y));

      expect(trimLeft(a)).toEqual(x.isZero() ? EMPTY : x.encode('be'));
      expect(trimLeft(b)).toEqual(y.isZero() ? EMPTY : y.encode('be'));

      expect(padLeft(a, i + 1)).toEqual(x.encode('be', i + 1));
      expect(padLeft(b, i + 1)).toEqual(y.encode('be', i + 1));
    }
  });

  it('should do randomized tests (LE)', () => {
    for (let i = 0; i < 128; i++) {
      const off = i > 0 && (i & 3) === 0 ? 1 : 0;
      const a = random.randomBytes(i);
      const b = random.randomBytes(i - off);
      const x = BN.decode(a, 'le');
      const y = BN.decode(b, 'le');

      expect(countRight(a)).toEqual(x.bitLength());
      expect(countRight(b)).toEqual(y.bitLength());

      expect(compareRight(a, b)).toEqual(x.cmp(y));
      expect(compareRight(b, a)).toEqual(y.cmp(x));
      expect(compareRight(a, a)).toEqual(x.cmp(x));
      expect(compareRight(b, b)).toEqual(y.cmp(y));

      expect(trimRight(a)).toEqual(x.isZero() ? EMPTY : x.encode('le'));
      expect(trimRight(b)).toEqual(y.isZero() ? EMPTY : y.encode('le'));

      expect(padRight(a, i + 1)).toEqual(x.encode('le', i + 1));
      expect(padRight(b, i + 1)).toEqual(y.encode('le', i + 1));
    }
  });
});
