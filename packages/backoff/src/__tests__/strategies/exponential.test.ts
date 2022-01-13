import {ExponentialBackoffStrategy} from '../../strategies/exponential';

describe('ExponentialBackoffStrategy', () => {
  it('backoff delays should follow an exponential sequence', () => {
    const strategy = new ExponentialBackoffStrategy({
      initialDelay: 10,
      maxDelay: 1000,
    });

    // Exponential sequence: x[i] = x[i-1] * 2.
    const expectedDelays = [10, 20, 40, 80, 160, 320, 640, 1000, 1000];
    const actualDelays = expectedDelays.map(() => strategy.next());

    expect(expectedDelays).toEqual(actualDelays);
  });

  it('backoff delay factor should be configurable', () => {
    const strategy = new ExponentialBackoffStrategy({
      initialDelay: 10,
      maxDelay: 270,
      factor: 3,
    });

    // Exponential sequence: x[i] = x[i-1] * 3.
    const expectedDelays = [10, 30, 90, 270, 270];
    const actualDelays = expectedDelays.map(() => strategy.next());

    expect(expectedDelays).toEqual(actualDelays);
  });

  it('backoff delays should restart from the initial delay after reset', () => {
    const strategy = new ExponentialBackoffStrategy({
      initialDelay: 10,
      maxDelay: 1000,
    });

    strategy.next();
    strategy.reset();

    const backoffDelay = strategy.next();
    expect(backoffDelay).toEqual(10);
  });
});
