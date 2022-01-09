/**
 * A class constructor accepting arbitrary arguments.
 *
 * from https://github.com/loopbackio/loopback-next
 */
export type Constructor<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]) => T;

/**
 * Representing a value or promise. This type is used to represent results of
 * synchronous/asynchronous resolution of values.
 *
 * Note that we are using PromiseLike instead of native Promise to describe
 * the asynchronous variant. This allows producers of async values to use
 * any Promise implementation (e.g. Bluebird) instead of native Promises
 * provided by JavaScript runtime.
 *
 * from https://github.com/loopbackio/loopback-next
 */
export type ValueOrPromise<T> = T | PromiseLike<T>;
