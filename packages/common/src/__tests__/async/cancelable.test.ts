import assert from 'assert';
import {isPromiseCanceledError} from '../../errors/canceled';
import {CancelablePromise, createCancelablePromise} from '../../async/cancelable';
import {timeout} from '../../async/timeout';

describe('cancelablePromise', () => {
  test("set token, don't wait for inner promise", () => {
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

  test('cancel despite inner promise being resolved', () => {
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
  test('execution order (sync)', () => {
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
  test('execution order (async)', () => {
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

  test('get inner result', async () => {
    const promise = createCancelablePromise(token => {
      return timeout(12).then(_ => 1234);
    });

    const result = await promise;
    assert.strictEqual(result, 1234);
  });

  describe('parent', function () {
    test('cancel parent', async () => {
      const order: string[] = [];

      const parentCancellablePromise = createCancelablePromise(parentToken => {
        order.push('in parent callback');
        parentToken.onCancellationRequested(_ => order.push('parent cancelled'));
        return createCancelablePromise(parentToken, token => {
          order.push('in child callback');
          token.onCancellationRequested(_ => order.push('child cancelled'));
          return new Promise(c => setTimeout(c.bind(1234), 0));
        });
      });

      order.push('afterCreate');

      const promise = parentCancellablePromise.then(undefined, err => null).then(() => order.push('finally'));

      parentCancellablePromise.cancel();
      order.push('afterCancel');

      return promise.then(() =>
        assert.deepStrictEqual(order, [
          'in parent callback',
          'in child callback',
          'afterCreate',
          'parent cancelled',
          'child cancelled',
          'afterCancel',
          'finally',
        ]),
      );
    });

    test('cancel child', async () => {
      const order: string[] = [];

      let childCancellablePromise: CancelablePromise<void>;
      const parentCancellablePromise = createCancelablePromise(parentToken => {
        order.push('in parent callback');
        parentToken.onCancellationRequested(_ => order.push('parent cancelled'));
        return (childCancellablePromise = createCancelablePromise(parentToken, token => {
          order.push('in child callback');
          token.onCancellationRequested(_ => order.push('child cancelled'));
          return new Promise(c => setTimeout(c.bind(1234), 0));
        }));
      });

      order.push('afterCreate');

      const promise = parentCancellablePromise.then(undefined, err => null).then(() => order.push('finally'));

      expect(childCancellablePromise!).toBeTruthy();
      childCancellablePromise!.cancel();
      order.push('afterCancel');

      return promise.then(() =>
        assert.deepStrictEqual(order, [
          'in parent callback',
          'in child callback',
          'afterCreate',
          'child cancelled',
          'afterCancel',
          'finally',
        ]),
      );
    });
  });
});
