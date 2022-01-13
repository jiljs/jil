import {CancellationTokenSource} from '@jil/cancellation';
import assert from 'assert';
import {raceCancellation, raceTimeout} from '../race';
import {timeout} from '../timeout';

describe('race', function () {
  test('raceCancellation', async () => {
    const cts = new CancellationTokenSource();

    let triggered = false;
    const p = raceCancellation(
      timeout(100).then(() => (triggered = true)),
      cts.token,
    );
    cts.cancel();

    await p;

    assert.ok(!triggered);
  });

  test('raceTimeout', async () => {
    const cts = new CancellationTokenSource();

    // timeout wins
    let timedout = false;
    let triggered = false;

    const p1 = raceTimeout(
      timeout(100).then(() => (triggered = true)),
      1,
      () => (timedout = true),
    );
    cts.cancel();

    await p1;

    assert.ok(!triggered);
    assert.strictEqual(timedout, true);

    // promise wins
    timedout = false;

    const p2 = raceTimeout(
      timeout(1).then(() => (triggered = true)),
      100,
      () => (timedout = true),
    );
    cts.cancel();

    await p2;

    assert.ok(triggered);
    assert.strictEqual(timedout, false);
  });
});
