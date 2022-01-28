import {AEAD} from '../../aead';
const vectors = require('../data/aead.json');

describe('AEAD (ChaCha20+Poly1305)', function () {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  for (const [plain_, aad_, key_, nonce_, raw_] of vectors) {
    const input = Buffer.from(plain_, 'hex');
    const aad = Buffer.from(aad_, 'hex');
    const key = Buffer.from(key_, 'hex');
    const nonce = Buffer.from(nonce_, 'hex');
    const raw = Buffer.from(raw_, 'hex');
    const output = raw.slice(0, -16);
    const tag = raw.slice(-16);
    const text = key_.slice(0, 32) + '...';

    it(`should do incremental encrypt and decrypt (${text})`, () => {
      const data = Buffer.from(input);
      const ctx = new AEAD();

      ctx.init(key, nonce);
      ctx.aad(aad);
      ctx.encrypt(data);

      expect(data).toEqual(output);
      expect(ctx.final()).toEqual(tag);

      ctx.init(key, nonce);
      ctx.aad(aad);
      ctx.auth(data);

      expect(ctx.final()).toEqual(tag);

      ctx.init(key, nonce);
      ctx.aad(aad);
      ctx.decrypt(data);

      expect(data).toEqual(input);
      expect(ctx.final()).toEqual(tag);

      ctx.destroy();
    });

    it(`should do incremental encrypt and decrypt + verify (${text})`, () => {
      const data = Buffer.from(input);
      const ctx = new AEAD();

      ctx.init(key, nonce);
      ctx.aad(aad);
      ctx.encrypt(data);

      expect(data).toEqual(output);
      expect(ctx.verify(tag)).toBe(true);

      ctx.init(key, nonce);
      ctx.aad(aad);
      ctx.auth(data);

      expect(ctx.verify(tag)).toBe(true);

      ctx.init(key, nonce);
      ctx.aad(aad);
      ctx.decrypt(data);

      expect(data).toEqual(input);
      expect(ctx.verify(tag)).toBe(true);

      ctx.init(key, nonce);
      ctx.aad(aad);
      ctx.encrypt(data);

      const tag0 = Buffer.from(tag);

      tag0[0] ^= 1;

      expect(data).toEqual(output);
      expect(ctx.verify(tag0)).toBe(false);
    });

    it(`should do one-shot encrypt and decrypt (${text})`, () => {
      const data = Buffer.from(input);
      const mac = AEAD.encrypt(key, nonce, data, aad);

      expect(data).toEqual(output);
      expect(mac).toEqual(tag);

      expect(AEAD.auth(key, nonce, data, tag, aad)).toBeTruthy();
      expect(AEAD.decrypt(key, nonce, data, tag, aad)).toBeTruthy();

      expect(data).toEqual(input);

      expect(AEAD.encrypt(key, nonce, data, aad)).toEqual(tag);

      key[0] ^= 1;

      expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, key)).toBeFalsy();

      key[0] ^= 1;

      expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, aad)).toBeTruthy();

      nonce[0] ^= 1;

      expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, key)).toBeFalsy();

      nonce[0] ^= 1;

      expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, aad)).toBeTruthy();

      tag[0] ^= 1;

      expect(AEAD.auth(key, nonce, data, tag, aad)).toBeFalsy();
      expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, key)).toBeFalsy();

      tag[0] ^= 1;

      expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, aad)).toBeTruthy();

      if (data.length > 0) {
        data[0] ^= 1;

        expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, aad)).toBeFalsy();

        data[0] ^= 1;

        expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, aad)).toBeTruthy();
      }

      if (aad.length > 0) {
        aad[0] ^= 1;

        expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, aad)).toBeFalsy();

        aad[0] ^= 1;

        expect(AEAD.decrypt(key, nonce, Buffer.from(data), tag, aad)).toBeTruthy();
      }
    });
  }
});
