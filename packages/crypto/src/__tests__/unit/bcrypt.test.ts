import {bcrypt} from '../../bcrypt';

const hash192 = require('../data/bcrypt-hash192.json');
const hash256 = require('../data/bcrypt-hash256.json');
// https://github.com/patrickfav/bcrypt/wiki/Published-Test-Vectors
const bsd = require('../data/bcrypt-bsd.json');

const pbkdf: [string, string, number, number, string][] = [
  [
    'foo',
    'd8d5105271003f18afb751584ac9df4d',
    16,
    48,
    'ef312085086a7846ef9d43644ca3361d267622efff8e5cebed1ea9513a6aa0b5160de8bf76112e0c0edec68594777f75',
  ],
  [
    'foo',
    'eaf595e9bd3b2a8f1cfa249c7d8004c3',
    16,
    48,
    '44f364368852323144945ad404289b52c02d661817a321c1cd13b36041be584020a028bdfe138520c57f14d34d03fa62',
  ],
  [
    'foo',
    '9236ca8ddac428f6c83f6bb74ca5558e',
    16,
    48,
    '87700d9f89afab94b564ebbe7f85de7a2eb2aacbe3a423d1d4bbe290a9a2fd2e4e4dd1644029917a6db6871235a54c41',
  ],
  [
    '1234567890',
    'edf2ee939723f10f09cca07c90b31c47',
    16,
    48,
    '8476c2efc085d68616acf2809661839427346028dfc98ae0e82584c72fdfbc337920678fdb35c7296de17dfeb4f988f5',
  ],
];

describe('Bcrypt', function () {
  describe('Hash192', () => {
    for (const [sPass, sSalt, rounds, sExpect] of hash192) {
      const pass = Buffer.from(sPass, 'hex');
      const salt = Buffer.from(sSalt, 'hex');
      const expected = Buffer.from(sExpect, 'hex');
      const text = sExpect.slice(0, 32) + '...';

      it(`should derive key (hash192): ${text}`, function () {
        if (rounds > 8 && !process.env.CI) {
          return;
        }

        const key = bcrypt.hash192(pass, salt, rounds);
        expect(key).toEqual(expected);
      });
    }
  });

  describe('Generate', () => {
    for (const [pass, rounds, salt, expected] of bsd) {
      const text = expected.slice(0, 32) + '...';

      it(`should derive hash (bsd): ${text}`, function () {
        if (rounds > 8 && !process.env.CI) {
          return;
        }

        expect(bcrypt.generate(pass, salt, rounds, 'a')).toEqual(expected);
      });
    }
  });

  describe('Verify', () => {
    for (const [pass, rounds, , expected] of bsd) {
      const text = expected.slice(0, 32) + '...';

      it(`should verify hash (bsd): ${text}`, function () {
        if (rounds > 8 && !process.env.CI) {
          return;
        }

        expect(bcrypt.verify(pass, expected)).toBe(true);
      });
    }
  });

  describe('Hash256', () => {
    for (const [sPass, sSalt, rounds, sExpect] of hash256) {
      const pass = Buffer.from(sPass, 'hex');
      const salt = Buffer.from(sSalt, 'hex');
      const expected = Buffer.from(sExpect, 'hex');
      const text = sExpect.slice(0, 32) + '...';

      it(`should derive key (hash256): ${text}`, () => {
        const key = bcrypt.hash256(pass, salt, rounds);
        expect(key).toEqual(expected);
      });
    }
  });

  describe('PBKDF', () => {
    for (const [sPass, sSalt, rounds, size, sExpect] of pbkdf) {
      const pass = Buffer.from(sPass, 'binary');
      const salt = Buffer.from(sSalt, 'hex');
      const expected = Buffer.from(sExpect, 'hex');
      const text = sExpect.slice(0, 32) + '...';

      it(`should derive key (pbkdf): ${text}`, () => {
        const key = bcrypt.pbkdf(pass, salt, rounds, size);
        expect(key).toEqual(expected);
      });

      it(`should derive key (pbkdf, async): ${text}`, async () => {
        const key = await bcrypt.pbkdfAsync(pass, salt, rounds, size);
        expect(key).toEqual(expected);
      });
    }
  });
});
