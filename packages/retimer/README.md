# @jil/retimer

> A reschedulable setTimeout library for JavaScript. This library is built for building a keep alive functionality
> across a large numbers of clients/sockets.
>
> Forked from [retimer](https://github.com/mcollina/retimer)

## Install

```
npm install @jil/retimer --save
```

## Example

```ts
import { retimer } from '@jil/retimer';

const timer = retimer(() => {
  throw new Error('this should never get called!')
}, 20);

setTimeout(() => {
  timer.reschedule(50)
  setTimeout(() => {
    timer.clear()
  }, 10)
}, 10)
```

## API

### retimer(runner, timeout, ...args)

Exactly like your beloved `setTimeout`. Returns a `Retimer object`

### timer.reschedule(timeout)

Reschedule the timer. Retimer will not gove any performance benefit if the specified timeout comes __before__ the 
original timeout.

### timer.clear()

Clear the timer, like your beloved `clearTimeout`.

## How it works

Timers are stored in a Linked List in node.js, if you create a lot of timers this Linked List becomes massive which
makes __removing a timer an expensive operation__. Retimer let the old timer run at its time, and schedule a new one
accordingly, when the new one is __after__ the original timeout. There is no performance gain when the new timeout is
before the original one as retimer will just __remove the previous timer__.

## License

MIT
