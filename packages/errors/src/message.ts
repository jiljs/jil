/* eslint-disable @typescript-eslint/no-explicit-any */

import {isString} from 'tily/is/string';

function exceptionToErrorMessage(exception: any, verbose: boolean): string {
  if (verbose && (exception.stack || exception.stacktrace)) {
    return `${detectSystemErrorMessage(exception)}: ${
      stackToString(exception.stack) || stackToString(exception.stacktrace)
    }`;
  }

  return detectSystemErrorMessage(exception);
}

function stackToString(stack: string[] | string | undefined): string | undefined {
  if (Array.isArray(stack)) {
    return stack.join('\n');
  }

  return stack;
}

function detectSystemErrorMessage(exception: any): string {
  // See https://nodejs.org/api/errors.html#errors_class_system_error
  if (
    typeof exception.code === 'string' &&
    typeof exception.errno === 'number' &&
    typeof exception.syscall === 'string'
  ) {
    return `A system error occurred (${exception.message})`;
  }

  return exception.message || 'An unknown error occurred. Please consult the log for more details.';
}

/**
 * Tries to generate a human readable error message out of the error. If the verbose parameter
 * is set to true, the error message will include stacktrace details if provided.
 *
 * @returns A string containing the error message.
 */
export function toErrorMessage(error: any = null, verbose = false): string {
  if (!error) {
    return 'An unknown error occurred. Please consult the log for more details.';
  }

  if (Array.isArray(error)) {
    const errors: any[] = error.map(e => !!e);
    const msg = toErrorMessage(errors[0], verbose);

    if (errors.length > 1) {
      return `${msg} (${errors.length} errors in total)`;
    }

    return msg;
  }

  if (isString(error)) {
    return error;
  }

  if (error.detail) {
    const detail = error.detail;

    if (detail.error) {
      return exceptionToErrorMessage(detail.error, verbose);
    }

    if (detail.exception) {
      return exceptionToErrorMessage(detail.exception, verbose);
    }
  }

  if (error.stack) {
    return exceptionToErrorMessage(error, verbose);
  }

  if (error.message) {
    return error.message;
  }

  return 'An unknown error occurred. Please consult the log for more details.';
}
