import {noop} from 'tily/function/noop';
import {Emitter} from './emitter';
import {Event, EventUnsubscribe} from './event';

/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
export class Relay<T> {
  private listening = false;
  private inputEvent: Event<T> = Event.None;
  private inputEventUnsub: EventUnsubscribe = noop;

  private readonly emitter = new Emitter<T>({
    onFirstListenerDidAdd: () => {
      this.listening = true;
      this.inputEventUnsub = this.inputEvent(this.emitter.emit, this.emitter);
    },
    onLastListenerRemove: () => {
      this.listening = false;
      this.inputEventUnsub();
    },
  });

  readonly event: Event<T> = this.emitter.event;

  set input(event: Event<T>) {
    this.inputEvent = event;

    if (this.listening) {
      this.inputEventUnsub();
      this.inputEventUnsub = event(this.emitter.emit, this.emitter);
    }
  }

  dispose() {
    this.inputEventUnsub();
    this.emitter.dispose();
  }
}
