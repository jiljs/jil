import assert from 'assert';
import {Event} from '../event';
import {Emitter} from '../emitter';
import {DebounceEmitter} from '../debounce';
import {Samples} from './samples';
import {delay} from './support';

describe('Debounce', function () {
  test('Debounce Event', function (done: () => void) {
    const doc = new Samples.Document3();
    let count = 0;

    Event.debouncedListener(
      doc.onDidChange,
      (keys: unknown) => {
        count++;
        assert.ok(keys, 'was not expecting keys.');
        if (count === 1) {
          doc.setText('4');
          assert.deepStrictEqual(keys, ['1', '2', '3']);
        } else if (count === 2) {
          assert.deepStrictEqual(keys, ['4']);
          done();
        }
      },
      (prev: string[] | undefined, cur) => {
        if (!prev) {
          prev = [cur];
        } else if (prev.indexOf(cur) < 0) {
          prev.push(cur);
        }
        return prev;
      },
      10,
    );

    doc.setText('1');
    doc.setText('2');
    doc.setText('3');
  });

  test('Debounce Event - leading 1', async function () {
    const emitter = new Emitter<void>();
    let calls = 0;
    Event.debouncedListener(
      emitter.event,
      () => calls++,
      (l, e) => e,
      0,
      /*leading=*/ true,
    );

    // If the source event is fired once, the debounced (on the leading edge) event should be fired only once
    emitter.emit();

    await delay(1);
    assert.strictEqual(calls, 1);
  });

  test('Debounce Event - leading 2', async function () {
    const emitter = new Emitter<void>();
    let calls = 0;
    Event.debouncedListener(
      emitter.event,
      () => calls++,
      (l, e) => e,
      0,
      /*leading=*/ true,
    );

    // If the source event is fired multiple times, the debounced (on the leading edge) event should be fired twice
    emitter.emit();
    emitter.emit();
    emitter.emit();
    await delay(1);
    assert.strictEqual(calls, 2);
  });

  test('Debounce Event - leading reset', async function () {
    const emitter = new Emitter<number>();
    const calls: number[] = [];
    Event.debouncedListener(
      emitter.event,
      e => calls.push(e),
      (l, e) => (l ? l + 1 : 1),
      0,
      /*leading=*/ true,
    );

    emitter.emit(1);
    emitter.emit(1);
    await delay(1);
    assert.deepStrictEqual(calls, [1, 1]);
  });

  test('DebounceEmitter', async function () {
    let callCount = 0;
    let sum = 0;
    const emitter = new DebounceEmitter<number>({
      merge: arr => {
        callCount += 1;
        return arr.reduce((p, c) => p + c);
      },
    });

    emitter.event(e => {
      sum = e;
    });

    const p = Event.toPromise(emitter.event);

    emitter.emit(1);
    emitter.emit(2);

    await p;

    assert.strictEqual(callCount, 1);
    assert.strictEqual(sum, 3);
  });
});
