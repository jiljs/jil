import { isFunction } from "tily/is/function";
import { Emitter } from "./emitter";
import { onUnexpectedError } from "../errors/handler";

export class BailEmitter<T> extends Emitter<T> {
  emit(data: T) {
    if (this.hasListeners()) {
      // start/stop performance insight collection
      this._perfMon?.start(this._listeners.size);
      let count = 0;
      const result = [...this._listeners].some(listener => {
        count++;
        try {
          return (isFunction(listener) ? listener(data) : listener[0].call(listener[1], data)) === false;
        } catch (e) {
          onUnexpectedError(e);
        }
      });
      this._perfMon?.stop(count);
      return result;
    }
  }
}
