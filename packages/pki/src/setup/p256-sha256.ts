import {p256} from '@jil/crypto/p256';
import {SHA256} from '@jil/crypto/sha256';
import {oids} from '@jil/crypto/encoding/oids';
import {algs} from '../algs';

const {curves} = oids;

algs.addAsym({
  [curves.P256]: p256,
});

algs.addHash([SHA256]);
