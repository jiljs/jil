import assert from 'assert';
import {MicrotaskEmitter} from '../../event/microtask.emitter';

describe('Microtask', function () {
  test('Microtask Emitter', done => {
    let count = 0;
    assert.strictEqual(count, 0);
    const emitter = new MicrotaskEmitter<void>();
    const unsub = emitter.event(() => count++);
    emitter.emit();
    assert.strictEqual(count, 0);
    emitter.emit();
    assert.strictEqual(count, 0);
    // Should wait until the event loop ends and therefore be the last thing called
    setTimeout(() => {
      assert.strictEqual(count, 3);
      done();
    }, 0);
    queueMicrotask(() => {
      assert.strictEqual(count, 2);
      count++;
      unsub();
    });
  });
});
