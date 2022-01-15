import {Disposable} from './disposable';

export class RefCountedDisposable {
  private _counter = 1;

  constructor(private readonly _disposable: Disposable) {}

  acquire() {
    this._counter++;
    return this;
  }

  release() {
    if (--this._counter === 0) {
      this._disposable.dispose();
    }
    return this;
  }
}
