/* eslint-disable @typescript-eslint/no-explicit-any */
import {once} from 'tily/function/once';
import {isIterable} from './is-iterable';
import {
  markAsDisposed,
  markAsSingleton,
  setDisposableTracker,
  setParentOfDisposable,
  setParentOfDisposables,
  trackDisposable,
} from './tracker';

export {setDisposableTracker, markAsSingleton};

export class MultiDisposeError extends Error {
  constructor(public readonly errors: any[]) {
    super(`Encountered errors while disposing of store. Errors: [${errors.join(', ')}]`);
  }
}

export interface Disposable {
  dispose(): void;
}

export function isDisposable<E extends object>(thing: E): thing is E & Disposable {
  return typeof (<Disposable>thing).dispose === 'function' && (<Disposable>thing).dispose.length === 0;
}

export function dispose<T extends Disposable>(disposable: T): T;
export function dispose<T extends Disposable>(disposable: T | undefined): T | undefined;
export function dispose<T extends Disposable, A extends IterableIterator<T> = IterableIterator<T>>(
  disposables: IterableIterator<T>,
): A;
export function dispose<T extends Disposable>(disposables: Array<T>): Array<T>;
export function dispose<T extends Disposable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>;
export function dispose<T extends Disposable>(arg: T | IterableIterator<T> | undefined): any {
  if (isIterable(arg)) {
    const errors: any[] = [];

    for (const d of arg) {
      if (d) {
        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }

    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new MultiDisposeError(errors);
    }

    return Array.isArray(arg) ? [] : arg;
  } else if (arg) {
    arg.dispose();
    return arg;
  }
}

export function combinedDisposable(...disposables: Disposable[]): Disposable {
  const parent = toDisposable(() => dispose(disposables));
  setParentOfDisposables(disposables, parent);
  return parent;
}

export function toDisposable(fn: () => void): Disposable {
  const self = trackDisposable({
    dispose: once(() => {
      markAsDisposed(self);
      fn();
    }),
  });
  return self;
}

export class DisposableStore implements Disposable {
  static DISABLE_DISPOSED_WARNING = false;

  private _toDispose = new Set<Disposable>();

  constructor() {
    trackDisposable(this);
  }

  private _isDisposed = false;

  /**
   * Returns `true` if this object has been disposed
   */
  public get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */
  public dispose(): void {
    if (this._isDisposed) {
      return;
    }

    markAsDisposed(this);
    this._isDisposed = true;
    this.clear();
  }

  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */
  public clear(): void {
    try {
      dispose(this._toDispose.values());
    } finally {
      this._toDispose.clear();
    }
  }

  public add<T extends Disposable>(o: T): T;
  public add(o: Disposable['dispose']): Disposable;
  public add<T extends Disposable>(o: T | Disposable['dispose']): T | Disposable {
    if (!o) {
      return o;
    }
    if ((o as unknown as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    const disposable = typeof o === 'function' ? toDisposable(o) : o;

    setParentOfDisposable(disposable, this);
    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(
          new Error(
            'Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!',
          ).stack,
        );
      }
    } else {
      this._toDispose.add(disposable);
    }

    return disposable;
  }
}

export namespace Disposable {
  export const None = Object.freeze<Disposable>({
    dispose() {},
  });
}

export class DefaultDisposable implements Disposable {
  protected readonly _store = new DisposableStore();

  protected constructor() {
    trackDisposable(this);
    setParentOfDisposable(this._store, this);
  }

  public dispose(): void {
    markAsDisposed(this);

    this._store.dispose();
  }

  protected _register<T extends Disposable>(o: T): T {
    if ((o as any) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }
    return this._store.add(o);
  }
}
