/* eslint-disable @typescript-eslint/no-explicit-any */
import {EmitterOptions} from './emitter';
import {PauseableEmitter} from './pauseable.emitter';

export class DebounceEmitter<T> extends PauseableEmitter<T> {
  private readonly _delay: number;
  private _handle: any | undefined;

  constructor(options: EmitterOptions & {merge: (input: T[]) => T; delay?: number}) {
    super(options);
    this._delay = options.delay ?? 100;
  }

  override emit(data: T): boolean {
    if (!this._handle) {
      this.pause();
      this._handle = setTimeout(() => {
        this._handle = undefined;
        this.resume();
      }, this._delay);
    }
    return super.emit(data);
  }
}
