import fs from 'fs';
import Path from 'path';
import * as bio from '@jil/bufio';
import {asn1, pkcs8} from '../../../encoding';
import {rsa} from '../../../rsa';
import {p256} from '../../../p256';
import {secp256k1} from '../../../secp256k1';
import {ed25519} from '../../../ed25519';
import {dsa} from '../../../dsa';

const DSA_PUB_PATH = Path.resolve(__dirname, '..', '..', 'data', 'testdsapub.pem');

const dsaPubPem = fs.readFileSync(DSA_PUB_PATH, 'utf8');

function readPEM(name: string) {
  const path = Path.resolve(__dirname, '..', '..', 'data', `${name}.pem`);
  return fs.readFileSync(path, 'utf8');
}

const keys = [
  // ['DSA', dsa, readPEM('dsa-pkcs8')],
  ['RSA', rsa, readPEM('rsa-pkcs8')],
  ['P256', p256, readPEM('p256-pkcs8')],
  ['SECP256K1', secp256k1, readPEM('secp256k1-pkcs8')],
  ['ED25519', ed25519, readPEM('ed25519-pkcs8')],
];

describe('PKCS8', function () {
  it('should parse PKCS8', () => {
    const pki = pkcs8.PublicKeyInfo.fromPEM<pkcs8.PublicKeyInfo>(dsaPubPem);

    expect(pki.algorithm.algorithm.getKeyAlgorithmName()).toEqual('DSA');
    expect(pki.algorithm.parameters.node.type).toBe(16); // SEQ
    expect(pki.publicKey.type).toBe(3); // BITSTRING
    expect(pki.publicKey.bits).toBe(1056);

    const br = bio.read(pki.algorithm.parameters.node.value);
    const p = asn1.Unsigned.read(br);
    const q = asn1.Unsigned.read(br);
    const g = asn1.Unsigned.read(br);
    const y = asn1.Unsigned.decode(pki.publicKey.rightAlign());

    const key = dsa.publicKeyImport({
      p: p.value,
      q: q.value,
      g: g.value,
      y: y.value,
    });

    expect(dsa.publicKeyVerify(key)).toBeTruthy();

    expect(pki.toPEM()).toBe(dsaPubPem);
  });

  // eslint-disable-next-line
  for (const [name, alg, str1] of keys) it(`should parse and re-serialize ${name} key`, () => {});
});
