import {createInternalDebugger, sentenceCase} from '../debug';

describe('createInternalDebugger()', () => {
  it('returns a `debug` instance', () => {
    const debug = createInternalDebugger('foo');

    expect(typeof debug).toBe('function');
    expect(debug.namespace).toBe('jil:foo');
  });

  it('formats to sentence case', () => {
    expect(sentenceCase('BaseExampleEvent')).toBe('base example event');
  });
});
