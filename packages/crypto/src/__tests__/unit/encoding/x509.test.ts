import path from 'path';
import fs from 'fs';
import {x509, pem} from '../../../encoding';

const CERTS_FILE = path.resolve(__dirname, '..', '..', 'data', 'certs.pem');
const CERT1_FILE = path.resolve(__dirname, '..', '..', 'data', 'x509-cert1.hex');
const CERT2_FILE = path.resolve(__dirname, '..', '..', 'data', 'x509-cert2.hex');

const certsPem = fs.readFileSync(CERTS_FILE, 'utf8');
const cert1Data = Buffer.from(
  fs
    .readFileSync(CERT1_FILE, 'utf8')
    .toString()
    .replace(/[\n\r ]/g, ''),
  'hex',
);
const cert2Data = Buffer.from(
  fs
    .readFileSync(CERT2_FILE, 'utf8')
    .toString()
    .replace(/[\n\r ]/g, ''),
  'hex',
);

function clear(crt: x509.Certificate) {
  crt.raw = null;
  crt.tbsCertificate.raw = null;
  crt.tbsCertificate.subjectPublicKeyInfo.raw = null;
}

describe('x509', function () {
  describe('from pem', function () {
    let i = 0;
    for (const block of pem.decode(certsPem)) {
      it(`should deserialize and re-serialize certificate (${i++})`, () => {
        const crt1 = x509.Certificate.decode<x509.Certificate>(block.data);
        const raw1 = crt1.encode();
        const crt2 = x509.Certificate.decode<x509.Certificate>(raw1);
        const raw2 = crt2.encode();

        clear(crt1);
        clear(crt2);

        expect(crt1).toEqual(crt2);
        expect(raw1).toEqual(raw2);
      });
    }
  });

  describe('from hex', function () {
    let i = 0;
    for (const data of [cert1Data, cert2Data]) {
      it(`should encode and decode certificate ${i++}`, function () {
        const cert1 = x509.Certificate.decode<x509.Certificate>(data);
        const raw1 = cert1.encode();
        const cert2 = x509.Certificate.decode<x509.Certificate>(raw1);
        const raw2 = cert2.encode();

        clear(cert1);
        clear(cert2);

        expect(cert1).toEqual(cert2);
        expect(raw1).toEqual(raw2);
        expect(raw1).toEqual(data);
      });
    }
  });
});
