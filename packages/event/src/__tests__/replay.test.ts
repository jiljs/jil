import * as assert from 'assert';
import {Emitter} from '../emitter';
import {Relay} from '../relay';

describe('Relay', () => {
  test('should input work', () => {
    const e1 = new Emitter<number>();
    const e2 = new Emitter<number>();
    const relay = new Relay<number>();

    const result: number[] = [];
    const listener = (num: number) => result.push(num);
    const subscription = relay.event(listener);

    e1.emit(1);
    assert.deepStrictEqual(result, []);

    relay.input = e1.event;
    e1.emit(2);
    assert.deepStrictEqual(result, [2]);

    relay.input = e2.event;
    e1.emit(3);
    e2.emit(4);
    assert.deepStrictEqual(result, [2, 4]);

    subscription();
    e1.emit(5);
    e2.emit(6);
    assert.deepStrictEqual(result, [2, 4]);
  });

  test('should Relay dispose work', () => {
    const e1 = new Emitter<number>();
    const e2 = new Emitter<number>();
    const relay = new Relay<number>();

    const result: number[] = [];
    const listener = (num: number) => result.push(num);
    relay.event(listener);

    e1.emit(1);
    assert.deepStrictEqual(result, []);

    relay.input = e1.event;
    e1.emit(2);
    assert.deepStrictEqual(result, [2]);

    relay.input = e2.event;
    e1.emit(3);
    e2.emit(4);
    assert.deepStrictEqual(result, [2, 4]);

    relay.dispose();
    e1.emit(5);
    e2.emit(6);
    assert.deepStrictEqual(result, [2, 4]);
  });
});
