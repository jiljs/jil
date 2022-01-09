import {MixinTarget} from '@jil/types';
import {Disposable, DisposableStore} from './disposable';
import {markAsDisposed, setParentOfDisposable, trackDisposable} from './tracker';

export function DisposableMixin<T extends MixinTarget<Object>>(superClass: T) {
  return class extends superClass implements Disposable {
    readonly _store = new DisposableStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      trackDisposable(this);
      setParentOfDisposable(this._store, this);
    }

    public dispose(): void {
      markAsDisposed(this);

      this._store.dispose();
    }

    _register<D extends Disposable>(o: D): D {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((o as any) === this) {
        throw new Error('Cannot register a disposable on itself!');
      }
      return this._store.add(o);
    }
  };
}
