/* eslint-disable @typescript-eslint/no-explicit-any */

const canceledName = 'Canceled';

/**
 * Checks if the given error is a promise in canceled state
 */
export function isPromiseCanceledError(error: any): boolean {
  return error instanceof Error && error.name === canceledName && error.message === canceledName;
}

// !!!IMPORTANT!!!
// Do NOT change this class because it is also used as an API-type.
export class CancellationError extends Error {
  constructor() {
    super(canceledName);
    this.name = this.message;
  }
}

/**
 * Returns an error that signals cancellation.
 */
export function canceled(): Error {
  const error = new Error(canceledName);
  error.name = error.message;
  return error;
}
