import { EventUnsubscribe, EventUnsubscribeStore } from "./event";

export class DefaultEventUnsubscribeStore implements EventUnsubscribeStore {
  protected handlers: Set<EventUnsubscribe> = new Set();

  add(unsub: EventUnsubscribe): void {
    this.handlers.add(unsub);
  }

  clear(): undefined | Error[] {
    const errors: Error[] = [];
    try {
      this.handlers.forEach(h => {
        try {
          h();
        } catch (e) {
          errors.push(e);
        }
      })
    } finally {
      this.handlers.clear();
    }
    return errors.length ? errors : undefined;
  }
}
