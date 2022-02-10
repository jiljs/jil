# @jil/module

> Load and resolve custom file types at runtime with a more powerful Node.js `require` replacement.

```ts
import {requireModule} from '@jil/module';

const result = requireModule('./some/non-js/file.ts');
```

## Features

- CommonJS based importing with `requireModule()`
- CommonJS interoperability with ESM-like files
- ECMAScript module based importing with a custom ESM loader
- Supported file types: TypeScript (`.ts`, `.tsx`)

## Installation

```
npm i @jil/module
```

## Documentation

- [https://boostlib.dev/docs/module](https://boostlib.dev/docs/module)
- [https://boostlib.dev/api/module](https://boostlib.dev/api/module)
