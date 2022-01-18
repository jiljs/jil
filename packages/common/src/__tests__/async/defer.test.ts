import assert from 'assert';
import {defer} from '../../async/defer';

describe('DeferredPromise', function () {
  test('should have correct members', function () {
    const d = defer();
    expect(d).toHaveProperty('then');
    expect(d).toEqual(d.promise);
    expect(typeof d.complete).toBe('function');
    expect(typeof d.error).toBe('function');
    expect(typeof d.cancel).toBe('function');
    expect(typeof d.resolve).toBe('function');
    expect(typeof d.reject).toBe('function');
  });

  test('resolves', async () => {
    const deferred = defer<number>();
    assert.strictEqual(deferred.isResolved, false);
    deferred.complete(42);
    assert.strictEqual(await deferred, 42);
    assert.strictEqual(deferred.isResolved, true);
  });

  test('rejects', async () => {
    const deferred = defer<number>();
    assert.strictEqual(deferred.isRejected, false);
    const err = new Error('oh no!');
    deferred.error(err);
    assert.strictEqual(await deferred.catch(e => e), err);
    assert.strictEqual(deferred.isRejected, true);
  });

  test('cancels', async () => {
    const deferred = defer<number>();
    assert.strictEqual(deferred.isRejected, false);
    deferred.cancel();
    assert.strictEqual((await deferred.catch(e => e)).name, 'Canceled');
    assert.strictEqual(deferred.isRejected, true);
  });
});
