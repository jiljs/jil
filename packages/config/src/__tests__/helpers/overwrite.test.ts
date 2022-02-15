import {overwrite} from '../../helpers/overwrite';

describe('overwrite()', () => {
  it('returns the next value', () => {
    expect(overwrite<number | string>('foo', 123)).toBe(123);
  });
});
