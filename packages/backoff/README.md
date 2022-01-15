# @jil/backoff

> A utility that allows retrying a function with an exponential delay between attempts.

## Installation

```
npm i @jil/backoff
```

## Usage

The `backoff<T>` function takes a promise-returning function to retry, and an optional `BackfofOptions` object. It
returns a `CancelablePromise<T>`.

```ts
declare function backoff<T>(
  runner: (token: CancellationToken) => Promise<T>,
  options?: BackoffOptions,
): CancelablePromise<T>;
```

Here is an example retrying a function that calls a hypothetical weather endpoint:

```ts
import {backoff} from '@jil/backoff';

function getWeather() {
  return fetch('weather-endpoint');
}

async function main() {
  try {
    const response = await backoff(() => getWeather());
    // process response
  } catch (e) {
    // handle error
  }
}

main();
```

Example for cancelation

```ts
import {backoff} from '@jil/backoff';

function getWeather(token: CancellationToken) {
  const request = fetch('weather-endpoint');
  token.onCancellationRequested(() => request.abort());
  return request;
}

async function main() {
  try {
    const request = backoff(() => getWeather());
    setTimeout(() => request.cancel(), 2000);
    // process response
  } catch (e) {
    // handle error
    // if canceld, a CanceledError throws
  }
}

main();
```

## BackoffOptions

- `strategy?: BackoffStrategyType | BackoffStrategyCtor`

  Specify the strategy type or strategy class. Built in strategies are `exponential` and `fibonacci`.

  Defaults to `fibonacci`

- `jitter?: JitterType | Jitter`

  Decides whether a [jitters](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) should be
  applied to the delay. Possible values are `full` and `none`.

  Defaults to `none`

- `initialDelay?: number`

  The delay, in milliseconds, before executing the function for the first time.

  Defaults to 100

- `maxDelay?: number`

  The maximum delay, in milliseconds, between two consecutive attempts.

  Defaults to Infinity, must be greater than initialDelay

- `maxNumOfAttempts?: number`

  The maximum number of times to attempt the function.

  Defaults to 10

- `factor?: number`

  The exponential factor. The `initialDelay` is multiplied by the `factor` to increase the delay between reattempts.

  Defaults to 2, must be greater than 1

- `delayFirstAttempt?: boolean`

  Decides whether the `initialDelay` should be applied before the first call. If `false`, the first call will occur
  without a delay.

  Defaults to false

- `retry?: (e: any, attemptNumber: number) => ValueOrPromise<any>`

  The `retry` function can be used to run logic after every failed attempt (e.g. logging a message, assessing the last
  error, etc.). It is called with the last error and the upcoming attempt number. Returning `true` will retry the
  function as long as the `numOfAttempts` has not been exceeded. Returning `false` will end the execution.

  Defaults to return ture always
