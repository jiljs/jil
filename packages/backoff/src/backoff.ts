import {ValueOrPromise} from '@jil/types';
import {CancellationToken} from '@jil/cancellation';
import {CancelablePromise, createCancelablePromise} from '@jil/async/cancelable';
import {timeout} from '@jil/async/timeout';
import {BackoffOptions, sanitizeOptions} from './options';
import {BackoffStrategy} from './strategy';
import {createStrategy} from './strategies';

const debug = require('debug')('backoff');

export type BackoffRunner<T> = (token: CancellationToken) => ValueOrPromise<T>;

export class Backoff<T> {
  protected strategy: BackoffStrategy;
  protected attemptNumber = 0;

  constructor(private runner: BackoffRunner<T>, private options: BackoffOptions) {
    this.strategy = createStrategy(options);
  }

  private get attemptLimitReached() {
    return this.attemptNumber >= this.options.maxNumOfAttempts;
  }

  public run(): CancelablePromise<T> {
    debug('run');
    return createCancelablePromise(async token => {
      while (!this.attemptLimitReached) {
        debug(`attempting #${this.attemptNumber}`);
        try {
          const ms = this.next();
          debug(`delay ${ms}ms`);
          if (ms > 0) {
            await timeout(ms, token);
          }
          debug(`invoke runner`);
          return await this.runner(token);
        } catch (e) {
          debug(`invoke options.retry`);
          this.attemptNumber++;
          const shouldRetry = await this.options.retry(e, this.attemptNumber);
          const proceed = shouldRetry && !this.attemptLimitReached && !token.isCancellationRequested;
          debug(`continue retrying: ${proceed}`);
          if (debug.enabled && !proceed) {
            if (!shouldRetry) {
              debug(`> options.retry returns ${shouldRetry}`);
            }
            if (this.attemptLimitReached) {
              debug(`> attempt limit reached is ${this.attemptLimitReached}`);
            }
            if (token.isCancellationRequested) {
              debug(`> cancel request is ${token.isCancellationRequested}`);
            }
          }
          if (!proceed) {
            throw e;
          }
        }
      }

      throw new Error('Something went wrong.');
    });
  }

  private next() {
    if (this.attemptNumber === 0 && !this.options.delayFirstAttempt) {
      return 0;
    }
    return this.strategy.next();
  }
}

export function backoff<T>(runner: BackoffRunner<T>, options: Partial<BackoffOptions> = {}): CancelablePromise<T> {
  const sanitizedOptions = sanitizeOptions(options);
  return new Backoff(runner, sanitizedOptions).run();
}
