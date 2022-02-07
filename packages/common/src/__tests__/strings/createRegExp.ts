import assert from 'assert';
import {createRegExp} from '../../strings/createRegExp';

describe('string/createRegExp', function () {
  test('createRegExp', () => {
    // Empty
    assert.throws(() => createRegExp('', false));

    // Escapes appropriately
    assert.strictEqual(createRegExp('abc', false).source, 'abc');
    assert.strictEqual(createRegExp('([^ ,.]*)', false).source, '\\(\\[\\^ ,\\.\\]\\*\\)');
    assert.strictEqual(createRegExp('([^ ,.]*)', true).source, '([^ ,.]*)');

    // Whole word
    assert.strictEqual(createRegExp('abc', false, {wholeWord: true}).source, '\\babc\\b');
    assert.strictEqual(createRegExp('abc', true, {wholeWord: true}).source, '\\babc\\b');
    assert.strictEqual(createRegExp(' abc', true, {wholeWord: true}).source, ' abc\\b');
    assert.strictEqual(createRegExp('abc ', true, {wholeWord: true}).source, '\\babc ');
    assert.strictEqual(createRegExp(' abc ', true, {wholeWord: true}).source, ' abc ');

    const regExpWithoutFlags = createRegExp('abc', true);
    assert(!regExpWithoutFlags.global);
    assert(regExpWithoutFlags.ignoreCase);
    assert(!regExpWithoutFlags.multiline);

    const regExpWithFlags = createRegExp('abc', true, {global: true, matchCase: true, multiline: true});
    assert(regExpWithFlags.global);
    assert(!regExpWithFlags.ignoreCase);
    assert(regExpWithFlags.multiline);
  });
});
