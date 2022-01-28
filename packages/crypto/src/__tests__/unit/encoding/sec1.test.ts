import {sec1} from '../../../encoding';

const secpPriv = '47241e0e57d721fb1d89546bdc6c89ef9ece2f68c6d9ae59e1fe234917b74d4d';

const secpPub = '02c0d5ad34fd41ab7852c8488db707bc016aedf689470239e365889fd98c26803b';

const secpPem = `
-----BEGIN EC PRIVATE KEY-----
MFQCAQEEIEckHg5X1yH7HYlUa9xsie+ezi9oxtmuWeH+I0kXt01NoAcGBSuBBAAK
oSQDIgACwNWtNP1Bq3hSyEiNtwe8AWrt9olHAjnjZYif2YwmgDs=
-----END EC PRIVATE KEY-----
`;

const secpPem2 = `
-----BEGIN EC PRIVATE KEY-----
MIHTAgEBBCBHJB4OV9ch+x2JVGvcbInvns4vaMbZrlnh/iNJF7dNTaCBhTCBggIB
ATAsBgcqhkjOPQEBAiEA/////////////////////////////////////v///C8w
BgQBAAQBBwQhAnm+Zn753LusVaBilc6HCwcCm/zbLc4o2VnygVsW+BeYAiEA////
/////////////////rqu3OavSKA7v9JejNA2QUECAQGhJAMiAALA1a00/UGreFLI
SI23B7wBau32iUcCOeNliJ/ZjCaAOw==
-----END EC PRIVATE KEY-----
`;

const p256Priv = '55d8cac4638da243144e390c81507042af5f5d90af5a672fdeafaa250a73e944';

const p256Pub = '03c2f2b14bf9f6b395c254f3b5c121e034597b3065fa96777dfaa7ae70412033ff';

const p256Pem = `
-----BEGIN EC PRIVATE KEY-----
MFcCAQEEIFXYysRjjaJDFE45DIFQcEKvX12Qr1pnL96vqiUKc+lEoAoGCCqGSM49
AwEHoSQDIgADwvKxS/n2s5XCVPO1wSHgNFl7MGX6lnd9+qeucEEgM/8=
-----END EC PRIVATE KEY-----
`;

describe('SEC1', function () {
  it('should parse secp256k1 key (1)', () => {
    const key = sec1.ECPrivateKey.fromPEM<sec1.ECPrivateKey>(secpPem);

    expect(key.version.toNumber()).toBe(1);
    expect(key.privateKey.value.toString('hex')).toEqual(secpPriv);
    expect(key.namedCurveOID.getCurveName()).toEqual('SECP256K1');
    expect(key.publicKey.bits).toBe(264);
    expect(key.publicKey.value.toString('hex')).toEqual(secpPub);
    expect(key.publicKey.rightAlign().toString('hex')).toEqual(secpPub);
    expect(key.toPEM().trim()).toEqual(secpPem.trim());
  });

  it('should parse secp256k1 key (2)', () => {
    const key = sec1.ECPrivateKey.fromPEM<sec1.ECPrivateKey>(secpPem2);

    expect(key.version.toNumber()).toBe(1);
    expect(key.privateKey.value.toString('hex')).toEqual(secpPriv);
    expect(key.namedCurveOID.getCurveName()).toBe(undefined);
    expect(key.publicKey.bits).toBe(264);
    expect(key.publicKey.value.toString('hex')).toEqual(secpPub);
    expect(key.publicKey.rightAlign().toString('hex')).toEqual(secpPub);
  });

  it('should parse p256 key', () => {
    const key = sec1.ECPrivateKey.fromPEM<sec1.ECPrivateKey>(p256Pem);

    expect(key.version.toNumber()).toBe(1);
    expect(key.privateKey.value.toString('hex')).toEqual(p256Priv);
    expect(key.namedCurveOID.getCurveName()).toEqual('P256');
    expect(key.publicKey.bits).toBe(264);
    expect(key.publicKey.value.toString('hex')).toEqual(p256Pub);
    expect(key.publicKey.rightAlign().toString('hex')).toEqual(p256Pub);
    expect(key.toPEM().trim()).toEqual(p256Pem.trim());
  });
});
