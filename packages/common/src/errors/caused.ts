/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Cause {
  stack?: string;
}

export interface CausedErrorOptions {
  cause?: Cause;

  [p: string]: any;
}

/**
 * This subclass of Error supports chaining.
 * If available, it uses the built-in support for property `.cause`.
 * Otherwise, it sets it up itself.
 *
 * @see https://github.com/tc39/proposal-error-cause
 */
export class CausedError extends Error {
  readonly cause?: Cause;

  constructor(message: string, options: CausedErrorOptions = {}) {
    super(message);
    if (isObject(options) && options.cause != null && !('cause' in this)) {
      const cause = options.cause;
      this.cause = cause;
      if ('stack' in cause) {
        this.stack = this.stack + '\nCAUSE: ' + cause.stack;
      }
    }
  }
}

function isObject(value: any): value is object {
  return value !== null && typeof value === 'object';
}
