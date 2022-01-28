import Path from 'path';
import fs from 'fs';
import {dsa} from '../../../dsa';
import {pem, openssl} from '../../../encoding';

const DSA_PARAMS = Path.resolve(__dirname, '..', '..', 'data', 'dsa-parameters.pem');
const DSA_PRIVATE = Path.resolve(__dirname, '..', '..', 'data', 'dsa-private.pem');
const DSA_PUBLIC = Path.resolve(__dirname, '..', '..', 'data', 'dsa-public.pem');

const dsaParamsPem = fs.readFileSync(DSA_PARAMS, 'utf8');
const dsaPrivatePem = fs.readFileSync(DSA_PRIVATE, 'utf8');
const dsaPublicPem = fs.readFileSync(DSA_PUBLIC, 'utf8');
const dsaParamsJson = require('../../data/dsa-parameters.json');
const dsaPrivateJson = require('../../data/dsa-private.json');
const dsaPublicJson = require('../../data/dsa-public.json');

describe('OpenSSL', function () {
  it('should deserialize DSA parameters', () => {
    const key: openssl.DSAParams = openssl.DSAParams.fromPEM(dsaParamsPem);
    const json = dsaParamsJson;

    expect(key.p.value.toString('hex')).toEqual(json.p);
    expect(key.q.value.toString('hex')).toEqual(json.q);
    expect(key.g.value.toString('hex')).toEqual(json.g);

    expect(key.toPEM()).toBe(dsaParamsPem);
  });

  it('should deserialize DSA private key', () => {
    const key: openssl.DSAPrivateKey = openssl.DSAPrivateKey.fromPEM(dsaPrivatePem);
    const json = dsaPrivateJson;

    expect(key.version.value.toString('hex')).toEqual(json.version);
    expect(key.p.value.toString('hex')).toEqual(json.p);
    expect(key.q.value.toString('hex')).toEqual(json.q);
    expect(key.g.value.toString('hex')).toEqual(json.g);
    expect(key.y.value.toString('hex')).toEqual(json.y);
    expect(key.x.value.toString('hex')).toEqual(json.x);

    expect(key.toPEM()).toBe(dsaPrivatePem);
  });

  it('should deserialize DSA public key', () => {
    const key: openssl.DSAPublicKey = openssl.DSAPublicKey.fromPEM(dsaPublicPem);
    const json = dsaPublicJson;

    expect(key.p.value.toString('hex')).toEqual(json.p);
    expect(key.q.value.toString('hex')).toEqual(json.q);
    expect(key.g.value.toString('hex')).toEqual(json.g);
    expect(key.y.value.toString('hex')).toEqual(json.y);

    expect(key.toPEM()).toBe(dsaPublicPem);
  });

  it('should deserialize DSA private key (backend)', () => {
    const data = pem.fromPEM(dsaPrivatePem, 'DSA PRIVATE KEY');
    const key = dsa.privateKeyExport(data);
    const json = dsaPrivateJson;

    expect(key.p.toString('hex')).toEqual(json.p);
    expect(key.q.toString('hex')).toEqual(json.q);
    expect(key.g.toString('hex')).toEqual(json.g);
    expect(key.y.toString('hex')).toEqual(json.y);
    expect(key.x.toString('hex')).toEqual(json.x);

    const data2 = dsa.privateKeyImport(key);
    expect(data).toEqual(data2);
    const pem2 = pem.toPEM(data2, 'DSA PRIVATE KEY');

    expect(pem2).toBe(dsaPrivatePem);
  });

  it('should deserialize DSA public key (backend)', () => {
    const data = pem.fromPEM(dsaPublicPem, 'DSA PUBLIC KEY');
    const key = dsa.publicKeyExport(data);
    const json = dsaPublicJson;

    expect(key.p.toString('hex')).toEqual(json.p);
    expect(key.q.toString('hex')).toEqual(json.q);
    expect(key.g.toString('hex')).toEqual(json.g);
    expect(key.y.toString('hex')).toEqual(json.y);

    const data2 = dsa.publicKeyImport(key);
    expect(data).toEqual(data2);
    const pem2 = pem.toPEM(data2, 'DSA PUBLIC KEY');

    expect(pem2).toBe(dsaPublicPem);
  });
});
