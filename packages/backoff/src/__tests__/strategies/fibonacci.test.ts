import { FibonacciBackoffStrategy } from "../../strategies/fibonacci";

describe("FibonacciBackoffStrategy", function() {

  it("backoff delays should follow a Fibonacci sequence", function() {
    // Fibonacci sequence: x[i] = x[i-1] + x[i-2].
    const strategy = new FibonacciBackoffStrategy({
      initialDelay: 10,
      maxDelay: 1000
    });
    const expectedDelays = [10, 10, 20, 30, 50, 80, 130, 210, 340, 550, 890, 1000];
    const actualDelays = [];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < expectedDelays.length; i++) {
      actualDelays.push(strategy.next());
    }

    expect(expectedDelays).toEqual(actualDelays);
  });

  it("backoff delays should restart from the initial delay after reset", function() {
    const strategy = new FibonacciBackoffStrategy({
      initialDelay: 10,
      maxDelay: 1000
    });

    strategy.next();
    strategy.reset();

    const backoffDelay = strategy.next();
    expect(backoffDelay).toEqual(10);
  });
});
