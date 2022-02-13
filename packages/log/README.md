# @jil/log

> Lightweight level based logging system

```ts
import {createLogger} from '@jil/log';

const log = createLogger();

log('Something has happened…');
```

## Features

- Isolated logger instances.
- Supports 6 logging levels, in order of priority: log, trace, debug, info, warn, error.
- Handles default and max logging levels.
- Customizable transports with writable streams.
- Toggleable logging at runtime.

## Installation

```
npm i @jil/log
```

## Documentation

- [https://boostlib.dev/docs/log](https://boostlib.dev/docs/log)
- [https://boostlib.dev/api/log](https://boostlib.dev/api/log)
