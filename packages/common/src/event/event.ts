/* eslint-disable @typescript-eslint/no-explicit-any */
import {Emitter} from './emitter';

/**
 * A function that is called when an event is emitted.
 */
export type EventListener<T> = (data: T) => any;

/**
 * A function that can be called to remove a previously attached event listener.
 */
export type EventUnsubscribe = () => void;

/**
 * A function that can be called to attach an event listener.
 *
 * Listeners are called in the order they are attached.
 */
export type Event<T> = (listener: EventListener<T>, thisArgs?: any, unsubs?: EventUnsubscribe[]) => EventUnsubscribe;

export namespace Event {
  const noop = () => {};

  export const None: Event<any> = () => noop;

  /**
   * Given an event, returns another event which only fires once.
   */
  export function once<T>(event: Event<T>): Event<T> {
    return (listener, thisArgs = null) => {
      // we need this, in case the event fires during the listener call
      let emitted = false;
      const unsubscribe: EventUnsubscribe = event((data: T) => {
        if (emitted) {
          return;
        } else if (unsubscribe) {
          unsubscribe();
        } else {
          emitted = true;
        }

        return listener.call(thisArgs, data);
      }, null);

      if (emitted) {
        unsubscribe();
      }

      return unsubscribe;
    };
  }

  export function debouncedListener<T, O = T>(
    event: Event<T>,
    listener: (data: O) => any,
    merge: (last: O | undefined, event: T) => O,
    delay = 100,
    leading = false,
  ): EventUnsubscribe {
    let output: O | undefined = undefined;
    let handle: any = undefined;
    let numDebouncedCalls = 0;

    return event(cur => {
      numDebouncedCalls++;
      output = merge(output, cur);

      if (leading && !handle) {
        listener(output);
        output = undefined;
      }

      clearTimeout(handle);
      handle = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const _output = output;
        output = undefined;
        handle = undefined;
        if (!leading || numDebouncedCalls > 1) {
          listener(_output!);
        }

        numDebouncedCalls = 0;
      }, delay);
    });
  }

  /**
   * Given an event, returns the same event but typed as `Event<void>`.
   */
  export function signal<T>(event: Event<T>): Event<void> {
    return event as Event<any> as Event<void>;
  }

  export function toPromise<T>(event: Event<T>): Promise<T> {
    return new Promise(resolve => once(event)(resolve));
  }

  export function runAndSubscribe<T>(event: Event<T>, handler: (e: T | undefined) => any): EventUnsubscribe {
    handler(undefined);
    return event(e => handler(e));
  }

  export interface NodeEventEmitter {
    on(event: string | symbol, listener: Function): unknown;

    removeListener(event: string | symbol, listener: Function): unknown;
  }

  export function fromNodeEventEmitter<T>(
    emitter: NodeEventEmitter,
    eventName: string,
    map: (...args: any[]) => T = id => id,
  ): Event<T> {
    const fn = (...args: any[]) => result.emit(map(...args));
    const onFirstListenerAdd = () => emitter.on(eventName, fn);
    const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
    const result = new Emitter<T>({onFirstListenerAdd, onLastListenerRemove});
    return result.event;
  }

  export interface DOMEventEmitter {
    addEventListener(event: string | symbol, listener: Function): void;

    removeEventListener(event: string | symbol, listener: Function): void;
  }

  export function fromDOMEventEmitter<T>(
    emitter: DOMEventEmitter,
    eventName: string,
    map: (...args: any[]) => T = id => id,
  ): Event<T> {
    const fn = (...args: any[]) => result.emit(map(...args));
    const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
    const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
    const result = new Emitter<T>({onFirstListenerAdd, onLastListenerRemove});
    return result.event;
  }
}
