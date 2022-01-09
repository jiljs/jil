/* eslint-disable @typescript-eslint/no-explicit-any */
import {isPromiseCanceledError} from './canceled';

export interface ErrorListenerCallback {
  (error: any): void;
}

export interface ErrorListenerUnbind {
  (): void;
}

// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
export class ErrorHandler {
  private unexpectedErrorHandler: (e: any) => void;
  private listeners: ErrorListenerCallback[];

  constructor() {
    this.listeners = [];

    this.unexpectedErrorHandler = function (e: any) {
      setTimeout(() => {
        if (e.stack) {
          throw new Error(e.message + '\n\n' + e.stack);
        }

        throw e;
      }, 0);
    };
  }

  addListener(listener: ErrorListenerCallback): ErrorListenerUnbind {
    this.listeners.push(listener);

    return () => {
      this._removeListener(listener);
    };
  }

  setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void {
    this.unexpectedErrorHandler = newUnexpectedErrorHandler;
  }

  getUnexpectedErrorHandler(): (e: any) => void {
    return this.unexpectedErrorHandler;
  }

  onUnexpectedError(e: any): void {
    this.unexpectedErrorHandler(e);
    this.emit(e);
  }

  // For external errors, we don't want the listeners to be called
  onUnexpectedExternalError(e: any): void {
    this.unexpectedErrorHandler(e);
  }

  private emit(e: any): void {
    this.listeners.forEach(listener => {
      listener(e);
    });
  }

  private _removeListener(listener: ErrorListenerCallback): void {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
}

export const errorHandler = new ErrorHandler();

export function setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void {
  errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}

export function onUnexpectedError(e: any): undefined {
  // ignore errors from cancelled promises
  if (!isPromiseCanceledError(e)) {
    errorHandler.onUnexpectedError(e);
  }
  return undefined;
}

export function onUnexpectedExternalError(e: any): undefined {
  // ignore errors from cancelled promises
  if (!isPromiseCanceledError(e)) {
    errorHandler.onUnexpectedExternalError(e);
  }
  return undefined;
}
