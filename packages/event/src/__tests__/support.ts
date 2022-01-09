import {AsyncEventCancellationToken} from '../async';
import {Event} from '../event';

export namespace CancellationToken {
  export const None: AsyncEventCancellationToken = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: Event.None,
  });
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
