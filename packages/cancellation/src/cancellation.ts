/* eslint-disable @typescript-eslint/no-explicit-any */

import {Event, EventUnsubscribe} from '@jil/event';
import {Emitter} from '@jil/event/emitter';

export interface CancellationToken {
  /**
   * A flag signalling is cancellation has been requested.
   */
  readonly isCancellationRequested: boolean;

  /**
   * An event which fires when cancellation is requested. This event
   * only ever fires `once` as cancellation can only happen once. Listeners
   * that are registered after cancellation will be called (next event loop run),
   * but also only once.
   *
   * @event onCancellationRequested
   */
  readonly onCancellationRequested: (
    listener: (e: any) => any,
    thisArgs?: any,
    unsubs?: EventUnsubscribe[],
  ) => EventUnsubscribe;
}

const shortcutEvent: Event<any> = Object.freeze(function (callback, context?): EventUnsubscribe {
  const handle = setTimeout(callback.bind(context), 0);
  return () => clearTimeout(handle);
});

export namespace CancellationToken {
  export function isCancellationToken(thing: unknown): thing is CancellationToken {
    if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
      return true;
    }
    if (thing instanceof MutableToken) {
      return true;
    }
    if (!thing || typeof thing !== 'object') {
      return false;
    }
    return (
      typeof (thing as CancellationToken).isCancellationRequested === 'boolean' &&
      typeof (thing as CancellationToken).onCancellationRequested === 'function'
    );
  }

  export const None: CancellationToken = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: Event.None,
  });

  export const Cancelled: CancellationToken = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: shortcutEvent,
  });
}

class MutableToken implements CancellationToken {
  private _isCancelled = false;
  private _emitter: Emitter<any> | null = null;

  get isCancellationRequested(): boolean {
    return this._isCancelled;
  }

  get onCancellationRequested(): Event<any> {
    if (this._isCancelled) {
      return shortcutEvent;
    }
    if (!this._emitter) {
      this._emitter = new Emitter<any>();
    }
    return this._emitter.event;
  }

  public cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;
      if (this._emitter) {
        this._emitter.emit(undefined);
        this.dispose();
      }
    }
  }

  public dispose(): void {
    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = null;
    }
  }
}

export class CancellationTokenSource {
  private readonly _parentUnsubscribe?: EventUnsubscribe = undefined;

  constructor(parent?: CancellationToken) {
    this._parentUnsubscribe = parent?.onCancellationRequested(this.cancel, this);
  }

  private _token?: CancellationToken = undefined;

  get token(): CancellationToken {
    if (!this._token) {
      // be lazy and create the token only when
      // actually needed
      this._token = new MutableToken();
    }
    return this._token;
  }

  cancel(): void {
    if (!this._token) {
      // save an object by returning the default
      // cancelled token when cancellation happens
      // before someone asks for the token
      this._token = CancellationToken.Cancelled;
    } else if (this._token instanceof MutableToken) {
      // actually cancel
      this._token.cancel();
    }
  }

  dispose(cancel = false): void {
    if (cancel) {
      this.cancel();
    }

    this._parentUnsubscribe?.();

    if (!this._token) {
      // ensure to initialize with an empty token if we had none
      this._token = CancellationToken.None;
    } else if (this._token instanceof MutableToken) {
      // actually dispose
      this._token.dispose();
    }
  }
}
