import {CancellationToken} from '../cancellation';
import {CancelablePromise} from './cancelable';

export function raceCancellation<T>(promise: Promise<T>, token: CancellationToken): Promise<T | undefined>;
export function raceCancellation<T>(promise: Promise<T>, token: CancellationToken, defaultValue: T): Promise<T>;
export function raceCancellation<T>(
  promise: Promise<T>,
  token: CancellationToken,
  defaultValue?: T,
): Promise<T | undefined> {
  return Promise.race([
    promise,
    new Promise<T | undefined>(resolve => token.onCancellationRequested(() => resolve(defaultValue))),
  ]);
}

/**
 * Returns as soon as one of the promises is resolved and cancels remaining promises
 */
export async function raceCancellablePromises<T>(cancellablePromises: CancelablePromise<T>[]): Promise<T> {
  let resolvedPromiseIndex = -1;
  const promises = cancellablePromises.map((promise, index) =>
    promise.then(result => {
      resolvedPromiseIndex = index;
      return result;
    }),
  );
  const result = await Promise.race(promises);
  cancellablePromises.forEach((cancellablePromise, index) => {
    if (index !== resolvedPromiseIndex) {
      cancellablePromise.cancel();
    }
  });
  return result;
}

export function raceTimeout<T>(promise: Promise<T>, timeout: number, onTimeout?: () => void): Promise<T | undefined> {
  let promiseResolve: ((value: T | undefined) => void) | undefined = undefined;

  const timer = setTimeout(() => {
    promiseResolve?.(undefined);
    onTimeout?.();
  }, timeout);

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<T | undefined>(resolve => (promiseResolve = resolve)),
  ]);
}
