import {Emitter} from './emitter';
import {Event} from './event';
import {once} from 'tily/function/once';

type Unsub = () => void;

interface Subscription<T> {
  event: Event<T>;
  unsub?: Unsub;
}

export class EventMultiplexer<T> {
  private readonly emitter: Emitter<T>;
  private hasListeners = false;
  private events: Subscription<T>[] = [];

  constructor() {
    this.emitter = new Emitter<T>({
      onFirstListenerAdd: () => this.onFirstListenerAdd(),
      onLastListenerRemove: () => this.onLastListenerRemove(),
    });
  }

  get event(): Event<T> {
    return this.emitter.event;
  }

  add(event: Event<T>): Unsub {
    const e = {event};
    this.events.push(e);

    if (this.hasListeners) {
      this.hook(e);
    }

    const unsub = () => {
      if (this.hasListeners) {
        this.unhook(e);
      }

      const idx = this.events.indexOf(e);
      this.events.splice(idx, 1);
    };

    return once(unsub);
  }

  dispose(): void {
    this.emitter.dispose();
  }

  private onFirstListenerAdd(): void {
    this.hasListeners = true;
    this.events.forEach(e => this.hook(e));
  }

  private onLastListenerRemove(): void {
    this.hasListeners = false;
    this.events.forEach(e => this.unhook(e));
  }

  private hook(e: Subscription<T>): void {
    e.unsub = e.event(r => this.emitter.emit(r));
  }

  private unhook(e: Subscription<T>): void {
    e.unsub?.();
    e.unsub = undefined;
  }
}
