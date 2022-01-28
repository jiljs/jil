/* eslint-disable @typescript-eslint/no-explicit-any */
export type OpFn = (data: Buffer) => Buffer;
export type HashInst = {digest: OpFn};

export type HashLike = OpFn | HashInst;

export function isHashFn(x: any): x is OpFn {
  return typeof x === 'function' && !x.digest;
}

export function isHashInst(x: any): x is HashInst {
  return typeof x?.digest === 'function';
}
