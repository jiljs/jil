import assert from 'assert';
import {Event} from '../../event';
import {Emitter} from '../../event/emitter';
import {EventBufferer} from '../../event/bufferer';
import {Samples} from './samples';

describe('EventBufferer', () => {
  test('should not buffer when not wrapped', () => {
    const bufferer = new EventBufferer();
    const counter = new Samples.EventCounter();
    const emitter = new Emitter<void>();
    const event = bufferer.wrapEvent(emitter.event);
    const unsub = event(counter.onEvent, counter);

    assert.strictEqual(counter.count, 0);
    emitter.emit();
    assert.strictEqual(counter.count, 1);
    emitter.emit();
    assert.strictEqual(counter.count, 2);
    emitter.emit();
    assert.strictEqual(counter.count, 3);

    unsub();
  });

  test('should buffer when wrapped', () => {
    const bufferer = new EventBufferer();
    const counter = new Samples.EventCounter();
    const emitter = new Emitter<void>();
    const event = bufferer.wrapEvent(emitter.event);
    const unsub = event(counter.onEvent, counter);

    assert.strictEqual(counter.count, 0);
    emitter.emit();
    assert.strictEqual(counter.count, 1);

    bufferer.bufferEvents(() => {
      emitter.emit();
      assert.strictEqual(counter.count, 1);
      emitter.emit();
      assert.strictEqual(counter.count, 1);
    });

    assert.strictEqual(counter.count, 3);
    emitter.emit();
    assert.strictEqual(counter.count, 4);

    unsub();
  });

  test('once', () => {
    const emitter = new Emitter<void>();

    let counter1 = 0,
      counter2 = 0,
      counter3 = 0;

    const listener1 = emitter.event(() => counter1++);
    const listener2 = Event.once(emitter.event)(() => counter2++);
    const listener3 = Event.once(emitter.event)(() => counter3++);

    assert.strictEqual(counter1, 0);
    assert.strictEqual(counter2, 0);
    assert.strictEqual(counter3, 0);

    listener3();
    emitter.emit();
    assert.strictEqual(counter1, 1);
    assert.strictEqual(counter2, 1);
    assert.strictEqual(counter3, 0);

    emitter.emit();
    assert.strictEqual(counter1, 2);
    assert.strictEqual(counter2, 1);
    assert.strictEqual(counter3, 0);

    listener1();
    listener2();
  });
});
