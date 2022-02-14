/**
 * An emitter which queue all events and then process them at the
 * end of the event loop.
 */
import {Emitter, EmitterOptions} from './emitter';

export class MicrotaskEmitter<T> extends Emitter<T> {
  private _queuedEvents: T[] = [];
  private readonly _mergeFn?: (input: T[]) => T;

  constructor(options?: EmitterOptions & {merge?: (input: T[]) => T}) {
    super(options);
    this._mergeFn = options?.merge;
  }

  override emit(event: T): boolean {
    this._queuedEvents.push(event);
    if (this._queuedEvents.length === 1) {
      queueMicrotask(() => {
        if (this._mergeFn) {
          super.emit(this._mergeFn(this._queuedEvents));
        } else {
          this._queuedEvents.forEach(e => super.emit(e));
        }
        this._queuedEvents = [];
      });
    }
    return true;
  }
}
