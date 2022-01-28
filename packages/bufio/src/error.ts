/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Encoding Error
 * @extends {Error}
 */
export class EncodingError extends Error {
  type: string;
  code: string;

  /**
   * Create an encoding error.
   */
  constructor(offset: number | string, reason?: string, start?: any) {
    super();

    this.type = 'EncodingError';
    this.name = 'EncodingError';
    this.code = 'ERR_ENCODING';
    this.message = `${reason} (offset=${offset}).`;

    if (Error.captureStackTrace) Error.captureStackTrace(this, start ?? EncodingError);
  }
}
