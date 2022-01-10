import assert from 'assert';
import {isPromiseCanceledError} from '@jil/errors/canceled';
import {createCancelablePromise} from '../cancelable';
import {timeout} from '../timeout';

describe('cancelablePromise', function () {
  test("set token, don't wait for inner promise", function () {
    let canceled = 0;
    const promise = createCancelablePromise(token => {
      token.onCancellationRequested(_ => {
        canceled += 1;
      });
      return new Promise(resolve => {
        /*never*/
      });
    });
    const result = promise.then(
      _ => assert.ok(false),
      err => {
        assert.strictEqual(canceled, 1);
        assert.ok(isPromiseCanceledError(err));
      },
    );
    promise.cancel();
    promise.cancel(); // cancel only once
    return result;
  });

  test('cancel despite inner promise being resolved', function () {
    let canceled = 0;
    const promise = createCancelablePromise(token => {
      token.onCancellationRequested(_ => {
        canceled += 1;
      });
      return Promise.resolve(1234);
    });
    const result = promise.then(
      _ => assert.ok(false),
      err => {
        assert.strictEqual(canceled, 1);
        assert.ok(isPromiseCanceledError(err));
      },
    );
    promise.cancel();
    return result;
  });

  // Cancelling a sync cancelable promise will fire the cancelled token.
  // Also, every `then` callback runs in another execution frame.
  test('execution order (sync)', function () {
    const order: string[] = [];

    const cancellablePromise = createCancelablePromise(token => {
      order.push('in callback');
      token.onCancellationRequested(_ => order.push('cancelled'));
      return Promise.resolve(1234);
    });

    order.push('afterCreate');

    const promise = cancellablePromise.then(undefined, err => null).then(() => order.push('finally'));

    cancellablePromise.cancel();
    order.push('afterCancel');

    return promise.then(() =>
      assert.deepStrictEqual(order, ['in callback', 'afterCreate', 'cancelled', 'afterCancel', 'finally']),
    );
  });

  // Cancelling an async cancelable promise is just the same as a sync cancellable promise.
  test('execution order (async)', function () {
    const order: string[] = [];

    const cancellablePromise = createCancelablePromise(token => {
      order.push('in callback');
      token.onCancellationRequested(_ => order.push('cancelled'));
      return new Promise(c => setTimeout(c.bind(1234), 0));
    });

    order.push('afterCreate');

    const promise = cancellablePromise.then(undefined, err => null).then(() => order.push('finally'));

    cancellablePromise.cancel();
    order.push('afterCancel');

    return promise.then(() =>
      assert.deepStrictEqual(order, ['in callback', 'afterCreate', 'cancelled', 'afterCancel', 'finally']),
    );
  });

  test('get inner result', async function () {
    const promise = createCancelablePromise(token => {
      return timeout(12).then(_ => 1234);
    });

    const result = await promise;
    assert.strictEqual(result, 1234);
  });
});
