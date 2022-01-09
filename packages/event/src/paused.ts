import {Emitter, EmitterOptions} from './emitter';

export class PauseableEmitter<T> extends Emitter<T> {
  protected _queue: T[] = [];
  private _pauses = 0;
  private readonly _mergeFn?: (input: T[]) => T;

  constructor(options?: EmitterOptions & {merge?: (input: T[]) => T}) {
    super(options);
    this._mergeFn = options?.merge;
  }

  isPaused() {
    return this._pauses !== 0;
  }

  pause(): void {
    this._pauses++;
  }

  resume(): void {
    if (this._pauses !== 0 && --this._pauses === 0) {
      if (this._mergeFn) {
        // use the merge function to create a single composite
        // event. make a copy in case firing pauses this emitter
        const events = Array.from(this._queue);
        this._queue.splice(0);
        super.emit(this._mergeFn(events));
      } else {
        // no merging, emit each event individually and test
        // that this emitter isn't paused halfway through
        while (!this._pauses && this._queue.length !== 0) {
          super.emit(this._queue.shift()!);
        }
      }
    }
  }

  override emit(data: T): boolean {
    if (this.hasListeners()) {
      if (this.isPaused()) {
        this._queue.push(data);
      } else {
        super.emit(data);
      }
    }
    return this.hasListeners();
  }
}
