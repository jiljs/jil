import { Emitter } from "../../event/emitter";
import { Event } from "../../event";

export namespace Samples {
  export class EventCounter {
    count = 0;

    reset() {
      this.count = 0;
    }

    onEvent() {
      this.count += 1;
    }
  }

  export class Document3 {
    private readonly _onDidChange = new Emitter<string>();

    onDidChange: Event<string> = this._onDidChange.event;

    setText(value: string) {
      //...
      this._onDidChange.emit(value);
    }
  }
}
