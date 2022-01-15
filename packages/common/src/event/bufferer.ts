import {Event} from './event';

/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventBufferer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.emit(); // event will not be emitted yet
 * });
 *
 * // event will only be emitted at this point
 * ```
 */
export class EventBufferer {
  private buffers: Function[][] = [];

  wrapEvent<T>(event: Event<T>): Event<T> {
    return (listener, thisArgs?) => {
      return event(data => {
        const buffer = this.buffers[this.buffers.length - 1];

        if (buffer) {
          buffer.push(() => listener.call(thisArgs, data));
        } else {
          listener.call(thisArgs, data);
        }
      }, undefined);
    };
  }

  bufferEvents<R = void>(fn: () => R): R {
    const buffer: Array<() => R> = [];
    this.buffers.push(buffer);
    const r = fn();
    this.buffers.pop();
    buffer.forEach(flush => flush());
    return r;
  }
}
