import {pem, pkcs1} from '../../../encoding';
import {rsa} from '../../../rsa';

const Path = require('path');
const fs = require('fs');

const RSA_PRIVATE = Path.resolve(__dirname, '..', '..', 'data', 'rsa-private.pem');
const RSA_PUBLIC = Path.resolve(__dirname, '..', '..', 'data', 'rsa-public.pem');

const rsaPrivatePem = fs.readFileSync(RSA_PRIVATE, 'utf8');
const rsaPublicPem = fs.readFileSync(RSA_PUBLIC, 'utf8');
const rsaPrivateJson = require('../../data/rsa-private.json');
const rsaPublicJson = require('../../data/rsa-public.json');

describe('PKCS1', function () {
  it('should deserialize PKCS1 private key', () => {
    const key = pkcs1.RSAPrivateKey.fromPEM<pkcs1.RSAPrivateKey>(rsaPrivatePem);
    const json = rsaPrivateJson;

    expect(key.version.value.toString('hex')).toEqual(json.version);
    expect(key.n.value.toString('hex')).toEqual(json.n);
    expect(key.e.value.toString('hex')).toEqual(json.e);
    expect(key.d.value.toString('hex')).toEqual(json.d);
    expect(key.p.value.toString('hex')).toEqual(json.p);
    expect(key.q.value.toString('hex')).toEqual(json.q);
    expect(key.dp.value.toString('hex')).toEqual(json.dp);
    expect(key.dq.value.toString('hex')).toEqual(json.dq);
    expect(key.qi.value.toString('hex')).toEqual(json.qi);

    expect(key.toPEM()).toBe(rsaPrivatePem);
  });

  it('should deserialize PKCS1 public key', () => {
    const key = pkcs1.RSAPublicKey.fromPEM<pkcs1.RSAPublicKey>(rsaPublicPem);
    const json = rsaPublicJson;

    expect(key.n.value.toString('hex')).toEqual(json.n);
    expect(key.e.value.toString('hex')).toEqual(json.e);

    expect(key.toPEM()).toBe(rsaPublicPem);
  });

  it('should deserialize PKCS1 private key (backend)', () => {
    const data = pem.fromPEM(rsaPrivatePem, 'RSA PRIVATE KEY');
    const key = rsa.privateKeyExport(data);
    const json = rsaPrivateJson;

    expect(key.n.toString('hex')).toEqual(json.n);
    expect(key.e.toString('hex')).toEqual(json.e);
    expect(key.d.toString('hex')).toEqual(json.d);
    expect(key.p.toString('hex')).toEqual(json.p);
    expect(key.q.toString('hex')).toEqual(json.q);
    expect(key.dp.toString('hex')).toEqual(json.dp);
    expect(key.dq.toString('hex')).toEqual(json.dq);
    expect(key.qi.toString('hex')).toEqual(json.qi);

    const data2 = rsa.privateKeyImport(key);
    expect(data).toEqual(data2);
    const pem2 = pem.toPEM(data2, 'RSA PRIVATE KEY');

    expect(pem2).toBe(rsaPrivatePem);
  });

  it('should deserialize PKCS1 public key (backend)', () => {
    const data = pem.fromPEM(rsaPublicPem, 'RSA PUBLIC KEY');
    const key = rsa.publicKeyExport(data);
    const json = rsaPublicJson;

    expect(key.n.toString('hex')).toEqual(json.n);
    expect(key.e.toString('hex')).toEqual(json.e);

    const data2 = rsa.publicKeyImport(key);
    expect(data).toEqual(data2);
    const pem2 = pem.toPEM(data2, 'RSA PUBLIC KEY');

    expect(pem2).toBe(rsaPublicPem);
  });
});
