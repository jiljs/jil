# @jil/types

> A basic TypeScript types library

## Install

```sh
npm install --save-dev @jil/types
```

## What's inside?

- [Install](#Install)
- Types
  - All TypeScript types from [ts-essential](https://github.com/krzkaczor/ts-essentials) expect any functions(`assert`
    and `noop` functions moved into [tily](https://www.npmjs.com/package/tily))
  - [Constructor](#Constructor)
  - [ValueOrPromise](#ValueOrPromise)
  - [MixinTarget](#MixinTarget)

### Constructor

A class constructor accepting arbitrary arguments.

**signature**

```ts
export declare type Constructor<T> = new (...args: any[]) => T;
```

### ValueOrPromise

Representing a value or promise. This type is used to represent results of synchronous/asynchronous resolution of
values.

**signature**

```ts
export type ValueOrPromise<T> = T | PromiseLike<T>;
```

### MixinTarget

A replacement for typeof Target to be used in mixin class definitions. This is a workaround for TypeScript limitation
described in:

- https://github.com/microsoft/TypeScript/issues/17293
- https://github.com/microsoft/TypeScript/issues/17744
- https://github.com/microsoft/TypeScript/issues/36060

```ts
export function MyMixin<T extends MixinTarget<Application>>(superClass: T) {
  return class extends superClass {
    // contribute new class members
  };
}
```
