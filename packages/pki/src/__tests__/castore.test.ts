import '../setup/all';
import assert from 'assert';
import {CAStore} from '../castore';
import {resolveFixturePath} from './support';
import {readCertsFromFile} from '../x509';

const certChainDst = resolveFixturePath('cas-leafs/dst-gitr-net-chain.pem');
const certLeafGlobalSign = resolveFixturePath('cas-leafs/globalsign-gts-google-com.pem');
const certLeafFrank4ddExpired = resolveFixturePath('cas-leafs/frank4dd-rsa-example-cert.pem');
const certLeafGithub = resolveFixturePath('certs/github.crt');

describe('castore', function () {
  it('should load CAs from directory', async function () {
    const cas = new CAStore();
    await cas.load(resolveFixturePath('cas/*'));
    assert.ok(cas.count > 0);
  });

  it('should verify success for single leaf certificate', async function () {
    const cas = new CAStore();
    await cas.load(resolveFixturePath('cas/*'));
    assert.ok(cas.verify(readCertsFromFile(certLeafGlobalSign)));
  });

  it('should verify success for chain certificate', async function () {
    const cas = new CAStore();
    await cas.load(resolveFixturePath('cas/*'));
    assert.ok(cas.verify(readCertsFromFile(certChainDst)));
  });

  it('should verify success without validityCheckDate option for expired certificate', async function () {
    const cas = new CAStore();
    await cas.load(resolveFixturePath('cas/*'));
    assert.ok(cas.verify(readCertsFromFile(certLeafFrank4ddExpired)));
  });

  it('should verify failure with validityCheckDate option enabled for expired certificate', async function () {
    const cas = new CAStore();
    await cas.load(resolveFixturePath('cas/*'));
    assert.throws(
      () =>
        cas.verify(readCertsFromFile(certLeafFrank4ddExpired), {
          validityCheckDate: new Date(),
        }),
      /has expired/,
    );
  });

  it('should verify failure without trust root', async function () {
    const cas = new CAStore();
    await cas.load(resolveFixturePath('cas/*'));
    assert.throws(() => cas.verify(readCertsFromFile(certLeafGithub)), /Certificate is not trusted/);
  });
});
