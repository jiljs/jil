/* eslint-disable @typescript-eslint/no-explicit-any */

export type ErrorLike =
  | Error
  | string
  | {
      code?: string | number;
      message?: string;
      [p: string]: any;
    };

export function isErrorLike(obj: any): obj is ErrorLike {
  return typeof obj === 'string' || obj instanceof Error || typeof obj?.message === 'string';
}
