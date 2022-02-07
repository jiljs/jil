import {stripWildcards} from '../../strings/stripWildcards';

describe('string/stripWildcards', function () {
  it('stripWildcards', function () {
    expect(stripWildcards('abc/*')).toBe('abc/');
  });
});
