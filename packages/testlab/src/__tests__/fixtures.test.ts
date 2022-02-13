import {copyFixtureToNodeModule} from '../fixtures';

describe('fixtures', () => {
  it('copyFixtureToNodeModule', function () {
    const clear = copyFixtureToNodeModule('module-basic', 'jil-test-module-basic');
    expect(require('jil-test-module-basic')).toBeTruthy();
    clear();
  });
});
