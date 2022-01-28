import path from 'path';
import fs from 'fs';
import {rfc3279} from '../../../encoding';

const DSA_PARAMS = path.resolve(__dirname, '..', '..', 'data', 'dsa-parameters.pem');

const dsaParamsPem = fs.readFileSync(DSA_PARAMS, 'utf8');
const dsaParamsJson = require('../../data/dsa-parameters.json');

describe('RFC3279', function () {
  it('should deserialize DSA parameters', () => {
    const key = rfc3279.DSAParams.fromPEM<rfc3279.DSAParams>(dsaParamsPem);
    const json = dsaParamsJson;

    expect(key.p.value.toString('hex')).toEqual(json.p);
    expect(key.q.value.toString('hex')).toEqual(json.q);
    expect(key.g.value.toString('hex')).toEqual(json.g);

    expect(key.toPEM()).toBe(dsaParamsPem);
  });
});
