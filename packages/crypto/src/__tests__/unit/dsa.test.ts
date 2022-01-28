import {dsa} from '../../dsa';

describe('dsa', function () {
  it('should import correctly', function () {
    expect(dsa).toBeTruthy();
    expect(typeof dsa.derive).toBe('function');
  });
});
