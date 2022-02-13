# @jil/translate

> Package and application level translations made easy. Wraps the powerful
> [i18next](https://www.npmjs.com/package/i18next) library to abstract complexity away and define common server-side
> settings.

```ts
import {createTranslator} from '@jil/translate';

const msg = createTranslator(['common', 'errors'], '../path/to/resources');

msg('common:welcome', {name: 'Jil'}); // Hello Jil!
```

## Features

- Isolated translator instances.
- Namespace aware resource bundles.
- Automatic locale detection, from command line options, or from the operating system.
- Supports multiple file types: JavaScript, JSON, YAML.
- Message interpolation, pluralization, nesting, and more.
- Plus all other features found in [i18next](https://www.i18next.com/)!

## Installation

```
npm i @jil/translate
```

## Documentation

- [https://boostlib.dev/docs/translate](https://boostlib.dev/docs/translate)
- [https://boostlib.dev/api/translate](https://boostlib.dev/api/translate)
