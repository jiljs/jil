import * as assert from 'assert';
import {PauseableEmitter} from '../../event/pauseable.emitter';

describe('PauseableEmitter', function () {
  test('basic', function () {
    const data: number[] = [];
    const emitter = new PauseableEmitter<number>();

    emitter.event(e => data.push(e));
    emitter.emit(1);
    emitter.emit(2);

    assert.deepStrictEqual(data, [1, 2]);
  });

  test('pause/resume - no merge', function () {
    const data: number[] = [];
    const emitter = new PauseableEmitter<number>();

    emitter.event(e => data.push(e));
    emitter.emit(1);
    emitter.emit(2);
    assert.deepStrictEqual(data, [1, 2]);

    emitter.pause();
    emitter.emit(3);
    emitter.emit(4);
    assert.deepStrictEqual(data, [1, 2]);

    emitter.resume();
    assert.deepStrictEqual(data, [1, 2, 3, 4]);
    emitter.emit(5);
    assert.deepStrictEqual(data, [1, 2, 3, 4, 5]);
  });

  test('pause/resume - merge', function () {
    const data: number[] = [];
    const emitter = new PauseableEmitter<number>({merge: a => a.reduce((p, c) => p + c, 0)});

    emitter.event(e => data.push(e));
    emitter.emit(1);
    emitter.emit(2);
    assert.deepStrictEqual(data, [1, 2]);

    emitter.pause();
    emitter.emit(3);
    emitter.emit(4);
    assert.deepStrictEqual(data, [1, 2]);

    emitter.resume();
    assert.deepStrictEqual(data, [1, 2, 7]);

    emitter.emit(5);
    assert.deepStrictEqual(data, [1, 2, 7, 5]);
  });

  test('double pause/resume', function () {
    const data: number[] = [];
    const emitter = new PauseableEmitter<number>();

    emitter.event(e => data.push(e));
    emitter.emit(1);
    emitter.emit(2);
    assert.deepStrictEqual(data, [1, 2]);

    emitter.pause();
    emitter.pause();
    emitter.emit(3);
    emitter.emit(4);
    assert.deepStrictEqual(data, [1, 2]);

    emitter.resume();
    assert.deepStrictEqual(data, [1, 2]);

    emitter.resume();
    assert.deepStrictEqual(data, [1, 2, 3, 4]);

    emitter.resume();
    assert.deepStrictEqual(data, [1, 2, 3, 4]);
  });

  test('resume, no pause', function () {
    const data: number[] = [];
    const emitter = new PauseableEmitter<number>();

    emitter.event(e => data.push(e));
    emitter.emit(1);
    emitter.emit(2);
    assert.deepStrictEqual(data, [1, 2]);

    emitter.resume();
    emitter.emit(3);
    assert.deepStrictEqual(data, [1, 2, 3]);
  });

  test('nested pause', function () {
    const data: number[] = [];
    const emitter = new PauseableEmitter<number>();

    let once = true;
    emitter.event(e => {
      data.push(e);

      if (once) {
        emitter.pause();
        once = false;
      }
    });
    emitter.event(e => {
      data.push(e);
    });

    emitter.pause();
    emitter.emit(1);
    emitter.emit(2);
    assert.deepStrictEqual(data, []);

    emitter.resume();
    assert.deepStrictEqual(data, [1, 1]); // paused after first event

    emitter.resume();
    assert.deepStrictEqual(data, [1, 1, 2, 2]); // remaing event delivered

    emitter.emit(3);
    assert.deepStrictEqual(data, [1, 1, 2, 2, 3, 3]);
  });
});
