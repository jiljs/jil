/* eslint-disable @typescript-eslint/no-explicit-any */
import {canceled} from '../errors/canceled';

export type ResolveFn<T = unknown> = (value?: T | Promise<T>) => void;
export type RejectFn = (reason?: unknown) => void;

export interface DeferredPromise<T> extends Promise<T> {
  readonly isRejected: boolean;
  readonly isResolved: boolean;
  readonly isSettled: boolean;

  /**
   * The deferred promise.
   */
  promise: Promise<T>;

  /**
   * Resolves the promise with a value or the result of another promise.
   * @param value - The value to resolve the promise with.
   */
  resolve(value?: T | Promise<T>): void;
  complete(value?: T | Promise<T>): void;

  /**
   * Reject the promise with a provided reason or error.
   * @param reason - The reason or error to reject the promise with.
   */
  reject(reason?: unknown): void;
  error(reason?: unknown): void;

  /**
   * Reject with canceled error
   */
  cancel(): void;
}

/**
 Create a deferred promise.
 @example
 ```
 function delay(milliseconds) {
	const deferred = defer();
	setTimeout(deferred.resolve, milliseconds, '🦄');
	return deferred.promise;
	// or
	// return deferred;
}
 console.log(await delay(100));
 //=> '🦄'
 ```
 */
export function defer<T>(): DeferredPromise<T> {
  let rejected = false;
  let resolved = false;
  let resolveFn: Function;
  let rejectFn: Function;

  const deferred = <DeferredPromise<T>>new Promise((c, e) => {
    resolveFn = c;
    rejectFn = e;
  });

  const resolve: ResolveFn<T> = value => {
    resolved = true;
    resolveFn(value);
  };

  const reject: RejectFn = reason => {
    rejected = true;
    rejectFn(reason);
  };

  deferred.promise = deferred;

  deferred.resolve = resolve;
  deferred.complete = resolve;
  deferred.reject = reject;
  deferred.error = reject;
  deferred.cancel = () => reject(canceled());

  void Object.defineProperty(deferred, 'isRejected', {
    get(): any {
      return rejected;
    },
  });

  void Object.defineProperty(deferred, 'isResolved', {
    get(): any {
      return resolved;
    },
  });

  void Object.defineProperty(deferred, 'isSettled', {
    get(): any {
      return resolved || rejected;
    },
  });

  return deferred;
}
