/* eslint-disable @typescript-eslint/no-explicit-any */

// see https://github.com/v8/v8/wiki/Stack%20Trace%20API#basic-stack-traces
export interface V8CallSite {
  getThis(): any;

  getTypeName(): string;

  getFunction(): string;

  getFunctionName(): string;

  getMethodName(): string;

  getFileName(): string;

  getLineNumber(): number;

  getColumnNumber(): number;

  getEvalOrigin(): string;

  isToplevel(): boolean;

  isEval(): boolean;

  isNative(): boolean;

  isConstructor(): boolean;

  toString(): string;
}
