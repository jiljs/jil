import assert from 'assert';
import {errorHandler, setUnexpectedErrorHandler} from '@jil/errors/handler';
import {AsyncEmitter, IWaitUntil} from '../async';
import {CancellationToken, delay} from './support';

describe('AsyncEmitter', function () {
  test('event has waitUntil-function', async function () {
    interface E extends IWaitUntil {
      foo: boolean;
      bar: number;
    }

    const emitter = new AsyncEmitter<E>();

    emitter.event(e => {
      assert.strictEqual(e.foo, true);
      assert.strictEqual(e.bar, 1);
      assert.strictEqual(typeof e.waitUntil, 'function');
    });

    await emitter.emitAsync({foo: true, bar: 1}, CancellationToken.None);
    emitter.dispose();
  });

  test('sequential delivery', async function () {
    interface E extends IWaitUntil {
      foo: boolean;
    }

    let globalState = 0;
    const emitter = new AsyncEmitter<E>();

    emitter.event(e => {
      e.waitUntil(
        delay(10).then(_ => {
          assert.strictEqual(globalState, 0);
          globalState += 1;
        }),
      );
    });

    emitter.event(e => {
      e.waitUntil(
        delay(1).then(_ => {
          assert.strictEqual(globalState, 1);
          globalState += 1;
        }),
      );
    });

    await emitter.emitAsync({foo: true}, CancellationToken.None);
    assert.strictEqual(globalState, 2);
  });

  test('sequential, in-order delivery', async function () {
    interface E extends IWaitUntil {
      foo: number;
    }

    const events: number[] = [];
    let done = false;
    const emitter = new AsyncEmitter<E>();

    // e1
    emitter.event(e => {
      e.waitUntil(
        delay(10).then(async _ => {
          if (e.foo === 1) {
            await emitter.emitAsync({foo: 2}, CancellationToken.None);
            assert.deepStrictEqual(events, [1, 2]);
            done = true;
          }
        }),
      );
    });

    // e2
    emitter.event(e => {
      events.push(e.foo);
      e.waitUntil(delay(7));
    });

    await emitter.emitAsync({foo: 1}, CancellationToken.None);
    assert.ok(done);
  });

  test('catch errors', async function () {
    const origErrorHandler = errorHandler.getUnexpectedErrorHandler();
    setUnexpectedErrorHandler(() => null);

    interface E extends IWaitUntil {
      foo: boolean;
    }

    let globalState = 0;
    const emitter = new AsyncEmitter<E>();

    emitter.event(e => {
      globalState += 1;
      e.waitUntil(new Promise((_r, reject) => reject(new Error())));
    });

    emitter.event(e => {
      globalState += 1;
      e.waitUntil(delay(10));
      e.waitUntil(delay(20).then(() => globalState++)); // multiple `waitUntil` are supported and awaited on
    });

    await emitter
      .emitAsync({foo: true}, CancellationToken.None)
      .then(() => {
        assert.strictEqual(globalState, 3);
      })
      .catch(e => {
        console.log(e);
        assert.ok(false);
      });

    setUnexpectedErrorHandler(origErrorHandler);
  });
});
