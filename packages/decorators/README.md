# @jil/decorators

> Experimental decorators for common patterns.
>
> Forked from [@boost/decorators](https://boostlib.dev/docs/decorators)

```ts
import {bind} from '@jil/decorators/bind';
import {memoize} from '@jil/decorators/memoize';

class Example {
  @bind()
  referencedMethod() {
    return this; // Class instance
  }

  @memoize()
  someExpensiveOperation() {
    // Do something heavy
  }
}
```

## Features

- `@bind` - Auto-bind a method's `this` to the class context.
- `@debounce` - Defer the execution of a method in milliseconds.
- `@deprecate` - Mark a property, method, or class as deprecated.
- `@memoize` - Cache and return the result of a method execution.
- `@throttle` - throttle the execution of a method to a timeframe in milliseconds.

## Installation

```
npm i @jil/decorators
```

## Documentation

- [https://jillib.dev/docs/decorators](https://jillib.dev/docs/decorators)
- [https://jillib.dev/api/decorators](https://jillib.dev/api/decorators)
