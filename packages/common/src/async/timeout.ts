import {CancellationToken} from '../cancellation';
import {canceled} from '../errors/canceled';
import {CancelablePromise, createCancelablePromise} from './cancelable';

export function timeout(millis: number): CancelablePromise<void>;
export function timeout(millis: number, token: CancellationToken): Promise<void>;
export function timeout(millis: number, token?: CancellationToken): CancelablePromise<void> | Promise<void> {
  if (!token) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    return createCancelablePromise(token => timeout(millis, token));
  }

  return new Promise((resolve, reject) => {
    const handle = setTimeout(() => {
      disposable();
      resolve();
    }, millis);
    const disposable = token.onCancellationRequested(() => {
      clearTimeout(handle);
      disposable();
      reject(canceled());
    });
  });
}

export function delay(millis: number): CancelablePromise<void>;
export function delay(millis: number, token: CancellationToken): Promise<void>;
export function delay(millis: number, token?: CancellationToken): CancelablePromise<void> | Promise<void> {
  return timeout(millis, token as CancellationToken);
}

export function clearableTimeout(handler: () => void, ms = 0): () => void {
  const timer = setTimeout(handler, ms);
  return () => clearTimeout(timer);
}
