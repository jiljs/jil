import * as assert from 'assert';
import {Emitter} from '../../event/emitter';
import {EventMultiplexer} from '../../event/multiplexer';

describe('EventMultiplexer', () => {
  test('works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();
    m.event(r => result.push(r));

    const e1 = new Emitter<number>();
    m.add(e1.event);

    assert.deepStrictEqual(result, []);

    e1.emit(0);
    assert.deepStrictEqual(result, [0]);
  });

  test('multiplexer dispose works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();
    m.event(r => result.push(r));

    const e1 = new Emitter<number>();
    m.add(e1.event);

    assert.deepStrictEqual(result, []);

    e1.emit(0);
    assert.deepStrictEqual(result, [0]);

    m.dispose();
    assert.deepStrictEqual(result, [0]);

    e1.emit(0);
    assert.deepStrictEqual(result, [0]);
  });

  test('event dispose works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();
    m.event(r => result.push(r));

    const e1 = new Emitter<number>();
    m.add(e1.event);

    assert.deepStrictEqual(result, []);

    e1.emit(0);
    assert.deepStrictEqual(result, [0]);

    e1.dispose();
    assert.deepStrictEqual(result, [0]);

    e1.emit(0);
    assert.deepStrictEqual(result, [0]);
  });

  test('mutliplexer event dispose works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();
    m.event(r => result.push(r));

    const e1 = new Emitter<number>();
    const l1 = m.add(e1.event);

    assert.deepStrictEqual(result, []);

    e1.emit(0);
    assert.deepStrictEqual(result, [0]);

    l1();
    assert.deepStrictEqual(result, [0]);

    e1.emit(0);
    assert.deepStrictEqual(result, [0]);
  });

  test('hot start works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();
    m.event(r => result.push(r));

    const e1 = new Emitter<number>();
    m.add(e1.event);
    const e2 = new Emitter<number>();
    m.add(e2.event);
    const e3 = new Emitter<number>();
    m.add(e3.event);

    e1.emit(1);
    e2.emit(2);
    e3.emit(3);
    assert.deepStrictEqual(result, [1, 2, 3]);
  });

  test('cold start works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();

    const e1 = new Emitter<number>();
    m.add(e1.event);
    const e2 = new Emitter<number>();
    m.add(e2.event);
    const e3 = new Emitter<number>();
    m.add(e3.event);

    m.event(r => result.push(r));

    e1.emit(1);
    e2.emit(2);
    e3.emit(3);
    assert.deepStrictEqual(result, [1, 2, 3]);
  });

  test('late add works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();

    const e1 = new Emitter<number>();
    m.add(e1.event);
    const e2 = new Emitter<number>();
    m.add(e2.event);

    m.event(r => result.push(r));

    e1.emit(1);
    e2.emit(2);

    const e3 = new Emitter<number>();
    m.add(e3.event);
    e3.emit(3);

    assert.deepStrictEqual(result, [1, 2, 3]);
  });

  test('add dispose works', () => {
    const result: number[] = [];
    const m = new EventMultiplexer<number>();

    const e1 = new Emitter<number>();
    m.add(e1.event);
    const e2 = new Emitter<number>();
    m.add(e2.event);

    m.event(r => result.push(r));

    e1.emit(1);
    e2.emit(2);

    const e3 = new Emitter<number>();
    const l3 = m.add(e3.event);
    e3.emit(3);
    assert.deepStrictEqual(result, [1, 2, 3]);

    l3();
    e3.emit(4);
    assert.deepStrictEqual(result, [1, 2, 3]);

    e2.emit(4);
    e1.emit(5);
    assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
  });
});
