import {isFalsyOrWhitespace} from '../../strings/isFalsyOrWhitespace';

describe('string/isFalsyOrWhitespace', function () {
  test('isFalsyOrWhitespace', () => {
    expect(isFalsyOrWhitespace('')).toBe(true);
    expect(isFalsyOrWhitespace('  ')).toBe(true);
    expect(isFalsyOrWhitespace('  hello  ')).toBe(false);
  });
});
