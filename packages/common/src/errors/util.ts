/* eslint-disable @typescript-eslint/no-explicit-any */
import {ErrorLike} from './types';

export function getErrorMessage(err: any): string {
  if (!err) {
    return 'Error';
  }

  if (err.message) {
    return err.message;
  }

  if (err.stack) {
    return err.stack.split('\n')[0];
  }

  return String(err);
}

export function toError(error: ErrorLike) {
  if (error instanceof Error) {
    return error;
  }

  if (error !== null && typeof error === 'object') {
    // Handle plain error objects with message property and/or possibly other metadata
    return Object.assign(new Error(error.message), error) as Error;
  }

  return new Error(error);
}
