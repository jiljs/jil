/* eslint-disable @typescript-eslint/no-explicit-any */

import {Jitter, JitterType} from './jitter';
import {BackoffStrategyCtor, BackoffStrategyType} from './strategy';
import {ValueOrPromise} from '@jil/common';

export interface BackoffOptions {
  /**
   * Specify the strategy type or strategy class. Built in strategies are `exponential` and `fibonacci`.
   *
   * Defaults to `fibonacci`
   *
   */
  strategy?: BackoffStrategyType | BackoffStrategyCtor;

  /**
   * Decides whether a [jitters](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
   * should be applied to the delay. Possible values are `full` and `none`.
   *
   * Defaults to `none`
   */
  jitter?: JitterType | Jitter;

  /**
   * The delay, in milliseconds, before executing the function for the first time.
   *
   * Defaults to 100
   */
  initialDelay?: number;

  /**
   * The maximum delay, in milliseconds, between two consecutive attempts.
   *
   * Defaults to Infinity, must be greater than initialDelay
   */
  maxDelay?: number;

  /**
   * The maximum number of times to attempt the function.
   *
   * Defaults to 10
   */
  maxNumOfAttempts?: number;

  /**
   * The exponential factor. The `initialDelay` is multiplied by the `factor` to
   * increase the delay between reattempts.
   *
   * Defaults to 2, must be greater than 1
   */
  factor?: number;

  /**
   * Decides whether the `initialDelay` should be applied before the first call.
   * If `false`, the first call will occur without a delay.
   *
   * Defaults to false
   */
  delayFirstAttempt?: boolean;

  /**
   * The `retry` function can be used to run logic after every failed attempt
   * (e.g. logging a message, assessing the last error, etc.). It is called with
   * the last error and the upcoming attempt number. Returning `true` will retry
   * the function as long as the `numOfAttempts` has not been exceeded.
   * Returning `false` will end the execution.
   *
   * Defaults to return ture always
   *
   * @param e
   * @param attemptNumber
   */
  retry?: (e: any, attemptNumber: number) => ValueOrPromise<any>;
}

const defaultOptions: BackoffOptions = {
  strategy: 'fibonacci',
  jitter: 'none',
  initialDelay: 100,
  maxDelay: Infinity,
  maxNumOfAttempts: 10,
  factor: 2,
  delayFirstAttempt: false,
  retry: () => true,
};

export function sanitizeOptions(options: Partial<BackoffOptions>): Required<BackoffOptions> {
  const sanitized = <Required<BackoffOptions>>{...defaultOptions, ...options};

  if (sanitized.initialDelay < 1) {
    throw new Error('The initial timeout must be greater than or equal 0');
  }

  if (sanitized.maxDelay < 1) {
    throw new Error('The initial timeout must be greater than or equal 0');
  }

  if (sanitized.maxDelay <= sanitized.initialDelay) {
    throw new Error('The maximal backoff delay must be greater than the initial backoff delay');
  }

  if (sanitized.maxNumOfAttempts < 1) {
    sanitized.maxNumOfAttempts = 1;
  }

  if (sanitized.factor < 1) {
    sanitized.factor = 1;
  }

  return sanitized;
}
