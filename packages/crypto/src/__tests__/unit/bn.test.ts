import {BN} from '../../bn';

describe('BN', function () {
  it('should import correctly', function () {
    expect(BN).toBeTruthy();
    expect(BN.name).toEqual('BN');
  });
});
