import {onUnexpectedError} from '@jil/errors/handler';
import {Emitter, ScopedListener} from './emitter';

export interface AsyncEventCancellationToken {
  isCancellationRequested: boolean;
}

export interface IWaitUntil {
  token: AsyncEventCancellationToken;
  waitUntil(thenable: Promise<unknown>): void;
}

export type IWaitUntilData<T> = Omit<Omit<T, 'waitUntil'>, 'token'>;

export class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {
  private _asyncDeliveryQueue?: Array<[ScopedListener<T>, IWaitUntilData<T>]>;

  async emitAsync(
    data: IWaitUntilData<T>,
    token: AsyncEventCancellationToken,
    promiseJoin?: (p: Promise<unknown>, listener: Function) => Promise<unknown>,
  ): Promise<void> {
    if (!this._listeners) {
      return;
    }

    if (!this._asyncDeliveryQueue) {
      this._asyncDeliveryQueue = [];
    }

    for (const listener of this._listeners) {
      this._asyncDeliveryQueue.push([listener, data]);
    }

    while (this._asyncDeliveryQueue.length > 0 && !token.isCancellationRequested) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const [listener, data] = this._asyncDeliveryQueue.shift()!;
      const thenables: Promise<unknown>[] = [];

      const dataWithWaitUntil = <T>{
        ...data,
        token,
        waitUntil: (p: Promise<unknown>): void => {
          if (Object.isFrozen(thenables)) {
            throw new Error('waitUntil can NOT be called asynchronous');
          }
          if (promiseJoin) {
            p = promiseJoin(p, typeof listener === 'function' ? listener : listener[0]);
          }
          thenables.push(p);
        },
      };

      try {
        if (typeof listener === 'function') {
          listener.call(undefined, dataWithWaitUntil);
        } else {
          listener[0].call(listener[1], dataWithWaitUntil);
        }
      } catch (e) {
        onUnexpectedError(e);
        continue;
      }

      // freeze thenables-collection to enforce sync-calls to
      // wait until and then wait for all thenables to resolve
      Object.freeze(thenables);

      await Promise.allSettled(thenables).then(values => {
        for (const value of values) {
          if (value.status === 'rejected') {
            onUnexpectedError(value.reason);
          }
        }
      });
    }
  }
}
