/* eslint-disable @typescript-eslint/no-explicit-any */
import {onUnexpectedError} from '../errors/handler';
import {Event, EventListener} from './event';
import {LeakageMonitor} from './leakage';
import {EventProfiling} from './profiling';

export type EmitterListenerAware = (emitter?: Emitter) => void;

export interface EmitterOptions {
  onFirstListenerAdd?: EmitterListenerAware;
  onFirstListenerDidAdd?: EmitterListenerAware;
  onListenerDidAdd?: EmitterListenerAware;
  onLastListenerRemove?: EmitterListenerAware;
}

export type ScopedListener<T> = EventListener<T> | [EventListener<T>, any];

/**
 * An emitter can be used to emit event.
 *
 * @example
 * ```ts
 * class Example {
 *   private readonly _onMessage = new Emitter<[message: string, sender: string]>();
 *   public readonly onMessage = this._onMessage.event;
 *
 *   public something() {
 *     this._onMessage.emit(["Hello World!", "something"]);
 *   }
 * }
 *
 * const example = new Example();
 *
 * example.onMessage(([message, sender]) => {
 *   console.log(`Message from ${sender}: ${message}`);
 * });
 *
 * example.something();
 * ```
 */
export class Emitter<T = any> {
  protected readonly _options?: EmitterOptions;
  protected readonly _leakageMon?: LeakageMonitor;
  protected readonly _perfMon?: EventProfiling;

  protected _disposed = false;
  protected _listeners = new Set<ScopedListener<T>>();
  protected _deliveryQueue?: [ScopedListener<T>, T][];

  constructor(options?: EmitterOptions) {
    this._options = options;
  }

  /**
   * The event that is controller by this emitter.
   */
  readonly event: Event<T> = (listener, thisArgs?, unsubs?) => {
    const firstListener = !this.hasListeners();
    if (firstListener) {
      this._options?.onFirstListenerAdd?.(this);
    }

    const scoped: ScopedListener<T> = thisArgs ? [listener, thisArgs] : listener;
    this._listeners.add(scoped);

    if (firstListener) {
      this._options?.onFirstListenerDidAdd?.(this);
    }

    this._options?.onListenerDidAdd?.(this);

    // check and record this emitter for potential leakage
    const removeMonitor = this._leakageMon?.check(this._listeners.size);

    const unsub = () => {
      removeMonitor?.();
      if (!this._disposed) {
        this._listeners.delete(scoped);
        if (!this.hasListeners()) {
          this._options?.onLastListenerRemove?.(this);
        }
      }
    };

    if (Array.isArray(unsubs)) {
      unsubs.push(unsub);
    }

    return unsub;
  };

  /**
   * Emit this event.
   * @returns `true` if any listeners have been called.
   */
  emit(data: T) {
    if (this.hasListeners()) {
      // put all [listener,event]-pairs into delivery queue
      // then emit all event. an inner/nested event might be
      // the driver of this

      if (!this._deliveryQueue) {
        this._deliveryQueue = [];
      }

      for (const listener of this._listeners) {
        this._deliveryQueue.push([listener, data]);
      }

      // start/stop performance insight collection
      this._perfMon?.start(this._deliveryQueue.length);

      while (this._deliveryQueue.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const [listener, data] = this._deliveryQueue.shift()!;

        try {
          if (typeof listener === 'function') {
            listener(data);
          } else {
            listener[0].call(listener[1], data);
          }
        } catch (e) {
          onUnexpectedError(e);
        }
      }

      this._perfMon?.stop();
    }
    return this.hasListeners();
  }

  dispose() {
    if (!this._disposed) {
      this._disposed = true;
      this._listeners?.clear();
      this._options?.onLastListenerRemove?.();
      this._leakageMon?.dispose();
    }
  }

  protected hasListeners() {
    return this._listeners.size > 0;
  }
}
