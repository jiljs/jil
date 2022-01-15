/* eslint-disable @typescript-eslint/no-explicit-any */
import * as assert from 'assert';
import {Disposable, DisposableStore, dispose, markAsSingleton, MultiDisposeError, toDisposable} from '../lifecycle';
import {ReferenceCollection} from '../lifecycle/reference';
import {ensureNoDisposablesAreLeakedInTestSuite, throwIfDisposablesAreLeaked} from './support';
import {DisposableMixin} from '../lifecycle/mixin';

class SampleDisposable implements Disposable {
  isDisposed = false;

  dispose() {
    this.isDisposed = true;
  }
}

describe('Lifecycle', () => {
  test('dispose single disposable', () => {
    const disposable = new SampleDisposable();

    expect(disposable.isDisposed).toBeFalsy();

    dispose(disposable);

    expect(disposable.isDisposed).toBeTruthy();
  });

  test('dispose disposable array', () => {
    const disposable = new SampleDisposable();
    const disposable2 = new SampleDisposable();

    expect(disposable.isDisposed).toBeFalsy();
    expect(disposable2.isDisposed).toBeFalsy();

    dispose([disposable, disposable2]);

    expect(disposable.isDisposed).toBeTruthy();
    expect(disposable2.isDisposed).toBeTruthy();
  });

  test('dispose disposables', () => {
    const disposable = new SampleDisposable();
    const disposable2 = new SampleDisposable();

    expect(disposable.isDisposed).toBeFalsy();
    expect(disposable2.isDisposed).toBeFalsy();

    dispose(disposable);
    dispose(disposable2);

    expect(disposable.isDisposed).toBeTruthy();
    expect(disposable2.isDisposed).toBeTruthy();
  });

  test('dispose array should dispose all if a child throws on dispose', () => {
    const disposedValues = new Set<number>();

    let thrownError: any;
    try {
      dispose([
        toDisposable(() => {
          disposedValues.add(1);
        }),
        toDisposable(() => {
          throw new Error('I am error');
        }),
        toDisposable(() => {
          disposedValues.add(3);
        }),
      ]);
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).toBeTruthy();
    expect(disposedValues.has(3)).toBeTruthy();
    expect(thrownError.message).toBe('I am error');
  });

  test('dispose array should rethrow composite error if multiple entries throw on dispose', () => {
    const disposedValues = new Set<number>();

    let thrownError: any;
    try {
      dispose([
        toDisposable(() => {
          disposedValues.add(1);
        }),
        toDisposable(() => {
          throw new Error('I am error 1');
        }),
        toDisposable(() => {
          throw new Error('I am error 2');
        }),
        toDisposable(() => {
          disposedValues.add(4);
        }),
      ]);
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).toBeTruthy();
    expect(disposedValues.has(4)).toBeTruthy();
    expect(thrownError instanceof MultiDisposeError).toBeTruthy();
    expect((thrownError as MultiDisposeError).errors.length).toBe(2);
    expect((thrownError as MultiDisposeError).errors[0].message).toBe('I am error 1');
    expect((thrownError as MultiDisposeError).errors[1].message).toBe('I am error 2');
  });

  test('Action bar has broken accessibility #100273', function () {
    const array = [
      {
        dispose() {},
      },
      {
        dispose() {},
      },
    ];
    const array2 = dispose(array);

    expect(array.length).toBe(2);
    expect(array2.length).toBe(0);
    expect(array !== array2).toBeTruthy();

    const set = new Set<Disposable>([
      {
        dispose() {},
      },
      {
        dispose() {},
      },
    ]);
    const setValues = set.values();
    const setValues2 = dispose(setValues);
    expect(setValues === setValues2).toBeTruthy();
  });
});

describe('DisposableStore', () => {
  test('dispose should call all child disposes even if a child throws on dispose', () => {
    const disposedValues = new Set<number>();

    const store = new DisposableStore();
    store.add(
      toDisposable(() => {
        disposedValues.add(1);
      }),
    );
    store.add(
      toDisposable(() => {
        throw new Error('I am error');
      }),
    );
    store.add(
      toDisposable(() => {
        disposedValues.add(3);
      }),
    );

    let thrownError: any;
    try {
      store.dispose();
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).toBeTruthy();
    expect(disposedValues.has(3)).toBeTruthy();
    expect(thrownError.message).toBe('I am error');
  });

  test('dispose should throw composite error if multiple children throw on dispose', () => {
    const disposedValues = new Set<number>();

    const store = new DisposableStore();
    store.add(
      toDisposable(() => {
        disposedValues.add(1);
      }),
    );
    store.add(
      toDisposable(() => {
        throw new Error('I am error 1');
      }),
    );
    store.add(
      toDisposable(() => {
        throw new Error('I am error 2');
      }),
    );
    store.add(
      toDisposable(() => {
        disposedValues.add(4);
      }),
    );

    let thrownError: any;
    try {
      store.dispose();
    } catch (e) {
      thrownError = e;
    }

    expect(disposedValues.has(1)).toBeTruthy();
    expect(disposedValues.has(4)).toBeTruthy();
    expect(thrownError instanceof MultiDisposeError).toBeTruthy();
    expect((thrownError as MultiDisposeError).errors.length).toBe(2);
    expect((thrownError as MultiDisposeError).errors[0].message).toBe('I am error 1');
    expect((thrownError as MultiDisposeError).errors[1].message).toBe('I am error 2');
  });
});

describe('Reference Collection', () => {
  class Collection extends ReferenceCollection<number> {
    private _count = 0;
    get count() {
      return this._count;
    }

    protected createReferencedObject(key: string): number {
      this._count++;
      return key.length;
    }

    protected destroyReferencedObject(key: string, object: number): void {
      this._count--;
    }
  }

  test('simple', () => {
    const collection = new Collection();

    const ref1 = collection.acquire('test');
    expect(ref1).toBeTruthy();
    expect(ref1.object).toBe(4);
    expect(collection.count).toBe(1);
    ref1.dispose();
    expect(collection.count).toBe(0);

    const ref2 = collection.acquire('test');
    const ref3 = collection.acquire('test');
    expect(ref2.object).toBe(ref3.object);
    expect(collection.count).toBe(1);

    const ref4 = collection.acquire('monkey');
    expect(ref4.object).toBe(6);
    expect(collection.count).toBe(2);

    ref2.dispose();
    expect(collection.count).toBe(2);

    ref3.dispose();
    expect(collection.count).toBe(1);

    ref4.dispose();
    expect(collection.count).toBe(0);
  });
});

function assertThrows(fn: () => void, test: (error: any) => any) {
  try {
    fn();
    assert.fail('Expected function to throw, but it did not.');
  } catch (e) {
    expect(test(e)).toBeTruthy();
  }
}

describe('No Leakage Utilities', () => {
  describe('throwIfDisposablesAreLeaked', () => {
    // test('throws if an event subscription is not cleaned up', () => {
    //   const eventEmitter = new Emitter();
    //
    //   assertThrows(() => {
    //     throwIfDisposablesAreLeaked(() => {
    //       eventEmitter.event(() => {
    //         // noop
    //       });
    //     });
    //   }, e => e.message.indexOf('These disposables were not disposed') !== -1);
    // });

    test('throws if a disposable is not disposed', () => {
      assertThrows(
        () => {
          throwIfDisposablesAreLeaked(() => {
            new DisposableStore();
          });
        },
        e => e.message.indexOf('These disposables were not disposed') !== -1,
      );
    });

    // test('does not throw if all event subscriptions are cleaned up', () => {
    //   const eventEmitter = new Emitter();
    //   throwIfDisposablesAreLeaked(() => {
    //     eventEmitter.event(() => {
    //       // noop
    //     }).dispose();
    //   });
    // });

    test('does not throw if all disposables are disposed', () => {
      // This disposable is reported before the test and not tracked.
      toDisposable(() => {});

      throwIfDisposablesAreLeaked(() => {
        // This disposable is marked as singleton
        markAsSingleton(toDisposable(() => {}));

        // These disposables are also marked as singleton
        const disposableStore = new DisposableStore();
        disposableStore.add(toDisposable(() => {}));
        markAsSingleton(disposableStore);

        toDisposable(() => {}).dispose();
      });
    });
  });

  describe('ensureNoDisposablesAreLeakedInTest', () => {
    ensureNoDisposablesAreLeakedInTestSuite();

    test('Basic Test', () => {
      toDisposable(() => {}).dispose();
    });
  });
});

describe('DisposableMixin', function () {
  test('extend from disposable mixin', () => {
    class Greeter extends DisposableMixin(Object) {}
    expect(typeof Greeter.prototype.dispose).toBe('function');
  });
});
