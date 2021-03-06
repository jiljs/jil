import {getEnv} from '../../helpers/getEnv';

describe('getEnv()', () => {
  it('returns from project named env', () => {
    process.env.JIL_TEST_ENV = 'test';

    expect(getEnv('jilTest')).toBe('test');

    delete process.env.JIL_TEST_ENV;
  });

  it('returns from node env', () => {
    process.env.NODE_ENV = 'staging';

    expect(getEnv('jilTest')).toBe('staging');

    process.env.NODE_ENV = 'test';
  });

  it('returns "development" if no env', () => {
    delete process.env.NODE_ENV;

    expect(getEnv('jilTest')).toBe('development');

    process.env.NODE_ENV = 'test';
  });
});
