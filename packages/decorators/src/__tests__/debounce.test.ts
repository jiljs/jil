import {timeout} from '@jil/common/async/timeout';
import {debounce} from '../debounce';

describe('@debounce()', () => {
  class Test {
    @debounce(100)
    log(...args: unknown[]) {
      console.log('Logged!', ...args);
    }
  }

  let spy: jest.SpyInstance;

  beforeEach(() => {
    // jest.useFakeTimers();

    spy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    spy.mockRestore();

    // jest.useRealTimers();
  });

  it('errors if applied to a class', () => {
    expect(() => {
      // @ts-expect-error Allow decorator here
      @debounce(100)
      class TestClass {}

      return TestClass;
    }).toThrowErrorMatchingSnapshot();
  });

  it('errors if applied to a property', () => {
    expect(() => {
      class TestProp {
        // @ts-expect-error Allow decorator here
        @debounce(100)
        value = 123;
      }
      return TestProp;
    }).toThrowErrorMatchingSnapshot();
  });

  it('logs only after the delay', async () => {
    const test = new Test();

    test.log();

    expect(spy).not.toHaveBeenCalled();

    test.log();

    expect(spy).not.toHaveBeenCalled();

    // jest.advanceTimersByTime(150);
    await timeout(100);

    expect(spy).toHaveBeenCalledWith('Logged!');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('passes arguments through', async () => {
    const test = new Test();

    test.log(1, 2);
    test.log(3, 4);
    test.log(5, 6);

    // jest.advanceTimersByTime(150);
    await timeout(100);

    expect(spy).toHaveBeenCalledWith('Logged!', 5, 6);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
