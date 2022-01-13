/* eslint-disable @typescript-eslint/no-explicit-any */

import {CancellationToken, CancellationTokenSource} from '@jil/cancellation';
import {canceled} from '@jil/errors/canceled';

export interface CancelablePromise<T> extends Promise<T> {
  isCanceled(): boolean;
  cancel(): void;
}

export type CallbackWithToken<T> = (token: CancellationToken) => Promise<T>;

export function createCancelablePromise<T>(
  parent: CancellationToken,
  callback: CallbackWithToken<T>,
): CancelablePromise<T>;
export function createCancelablePromise<T>(callback: CallbackWithToken<T>): CancelablePromise<T>;
export function createCancelablePromise<T>(
  parent?: CancellationToken | CallbackWithToken<T>,
  callback?: CallbackWithToken<T>,
): CancelablePromise<T> {
  if (typeof parent === 'function') {
    callback = parent;
    parent = undefined;
  }

  if (!callback) {
    throw new Error('callback is required');
  }

  const source = new CancellationTokenSource(parent);

  const thenable = callback(source.token);
  const promise = new Promise<T>((resolve, reject) => {
    const subscription = source.token.onCancellationRequested(() => {
      subscription();
      source.dispose();
      reject(canceled());
    });
    Promise.resolve(thenable).then(
      value => {
        subscription();
        source.dispose();
        resolve(value);
      },
      err => {
        subscription();
        source.dispose();
        reject(err);
      },
    );
  });

  return <CancelablePromise<T>>new (class {
    isCanceled() {
      return source.token.isCancellationRequested;
    }

    cancel() {
      source.cancel();
    }

    then<
      TResult1 = T,
      TResult2 = never,
    >(resolve?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, reject?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
      return promise.then(resolve, reject);
    }

    catch<
      TResult = never,
    >(reject?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult> {
      return this.then(undefined, reject);
    }

    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
      return promise.finally(onfinally);
    }
  })();
}
