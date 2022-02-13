# @jil/plugin

> Plugin based architecture that supports module loading, custom types, registries, scopes, and more.

```ts
import {Registry, Pluggable} from '@jil/plugin';

export interface Renderable<T> extends Pluggable<T> {
  render(): string | Promise<string>;
}

const registry = new Registry<Renderable>('jil', 'plugin', {
  validate(plugin) {
    if (typeof plugin.render !== 'function') {
      throw new TypeError('Plugins require a `render()` method.');
    }
  },
});

const plugin = await registry.load('jil-plugin-example');
```

## Features

- Custom plugin types and registries.
- Node module, file path, and configuration file loading strategies.
- Multiple module name formats: public, scoped public, scoped private.
- Structural contracts with life cycle events.
- Factory function pattern for plugin creation.
- Asynchronous by default.

## Installation

```
npm i  @jil/plugin
```

## Documentation

- [https://boostlib.dev/docs/plugin](https://boostlib.dev/docs/plugin)
- [https://boostlib.dev/api/plugin](https://boostlib.dev/api/plugin)
