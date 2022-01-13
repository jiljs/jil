/* eslint-disable @typescript-eslint/no-explicit-any */

import {backoff, BackoffRunner} from '../backoff';
import {BackoffOptions} from '../options';
import {
  mockFailResponse,
  mockSuccessResponse,
  promiseThatFailsOnceThenSucceeds,
  promiseThatIsRejected,
  promiseThatIsResolved,
} from './support';
import {timeout} from '@jil/async/timeout';
import {StopWatch} from '@jil/stopwatch';

describe('Backoff', function () {
  let backoffRunner: BackoffRunner<any>;
  let backoffOptions: Partial<BackoffOptions>;

  function initBackoff() {
    return backoff(backoffRunner, backoffOptions);
  }

  beforeEach(() => {
    backoffOptions = {initialDelay: 1};
    backoffRunner = jest.fn(promiseThatIsResolved());
  });

  describe('when request function is a promise that resolves', () => {
    it('returns the resolved value', () => {
      const request = initBackoff();
      return request.then(response => expect(response).toBe(mockSuccessResponse));
    });

    it('calls the request function only once', () => {
      const request = initBackoff();
      return request.then(() => expect(backoffRunner).toHaveBeenCalledTimes(1));
    });

    it(`when the #backoffOptions.maxNumOfAttempts is 0,
    it overrides the value and calls the method only once`, () => {
      backoffOptions.maxNumOfAttempts = 0;
      const request = initBackoff();

      return request.then(() => expect(backoffRunner).toHaveBeenCalledTimes(1));
    });
  });

  describe(`when the #backoffOptions.initialDelay is 100ms`, () => {
    const initialDelay = 100;

    beforeEach(() => (backoffOptions.initialDelay = initialDelay));

    it(`does not delay the first attempt`, () => {
      const startTime = Date.now();
      const request = initBackoff();

      return request.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const roundedDuration = Math.round(duration / 100) * 100;

        expect(roundedDuration).toBe(0);
      });
    });

    it(`when #backoffOptions.delayFirstAttempt is 'true',
    it delays the first attempt`, () => {
      backoffOptions.delayFirstAttempt = true;
      const startTime = Date.now();
      const request = initBackoff();

      return request.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const roundedDuration = Math.round(duration / 100) * 100;

        expect(roundedDuration).toBe(initialDelay);
      });
    });
  });

  describe('when request function is a promise that is rejected', () => {
    beforeEach(() => (backoffRunner = promiseThatIsRejected()));

    it('returns the rejected value', () => {
      const request = initBackoff();
      return request.catch(err => expect(err).toBe(mockFailResponse));
    });

    it('retries the request as many times as specified in #BackOffOptions.maxNumOfAttempts', async () => {
      const numOfAttempts = 2;
      backoffOptions.maxNumOfAttempts = numOfAttempts;
      backoffRunner = jest.fn(() => Promise.reject(mockFailResponse));

      try {
        await initBackoff();
      } catch {
        expect(backoffRunner).toHaveBeenCalledTimes(numOfAttempts);
      }
    });

    it(`when the #BackOffOptions.retry function is set to always return false,
    it only calls request function one time`, async () => {
      backoffOptions.retry = () => false;
      backoffOptions.maxNumOfAttempts = 2;
      backoffRunner = jest.fn(() => Promise.reject(mockFailResponse));

      try {
        await initBackoff();
      } catch {
        expect(backoffRunner).toHaveBeenCalledTimes(1);
      }
    });
  });

  it('when the #BackOffOptions.retry function returns a promise, it awaits it', async () => {
    const retryDuration = 100;
    backoffOptions.retry = () => new Promise(resolve => setTimeout(() => resolve(true), retryDuration));
    backoffRunner = promiseThatFailsOnceThenSucceeds();

    const start = Date.now();
    await initBackoff();
    const end = Date.now();

    const duration = end - start;
    const roundedDuration = Math.round(duration / retryDuration) * retryDuration;

    expect(roundedDuration).toBe(retryDuration);
  });

  describe(`when calling #backoff with a function that throws an error the first time, and succeeds the second time`, () => {
    beforeEach(() => (backoffRunner = jest.fn(promiseThatFailsOnceThenSucceeds())));

    it(`returns a successful response`, () => {
      const request = initBackoff();
      return request.then(response => expect(response).toBe(mockSuccessResponse));
    });

    it('calls the request function two times', async () => {
      await initBackoff();
      expect(backoffRunner).toHaveBeenCalledTimes(2);
    });

    it(`when setting the #BackOffOption.timeMultiple to a value,
    when setting the #BackOffOption.delayFirstAttempt to true,
    it applies a delay between the first and the second call`, async () => {
      const initialDelay = 100;
      const factor = 3;
      const totalExpectedDelay = initialDelay + factor * initialDelay;

      backoffOptions.strategy = 'exponential';
      backoffOptions.initialDelay = initialDelay;
      backoffOptions.factor = factor;
      backoffOptions.delayFirstAttempt = true;

      const start = Date.now();
      await initBackoff();
      const end = Date.now();

      const duration = end - start;
      const roundedDuration = Math.round(duration / initialDelay) * initialDelay;

      expect(roundedDuration).toBe(totalExpectedDelay);
    });
  });

  describe('cancelable', function () {
    it('should return a CancelablePromise', function () {
      const request = initBackoff();
      expect(typeof request.cancel).toBe('function');
    });

    it('cancel backoff with runner that do not support cancellation', async () => {
      const retriesToCancel = 3;
      const runDelay = 20;
      let elapsed = 0;
      let retries = 0;
      backoffRunner = async () => {
        const sw = StopWatch.create();
        if (retries === retriesToCancel) {
          setTimeout(() => request.cancel(), runDelay / 2);
        }
        await timeout(runDelay);
        if (retries === retriesToCancel) {
          elapsed = sw.elapsed();
        }
        return Promise.reject('rejected');
      };
      backoffOptions.initialDelay = 1;
      backoffOptions.retry = () => ++retries;

      const request = initBackoff();
      request.catch(e => expect(e.message).toMatch(/Canceled/));

      expect(request.isCanceled()).toBe(false);
      await timeout(200);
      expect(request.isCanceled()).toBe(true);

      expect(retries).toBe(retriesToCancel + 1);
      expect(Math.round(elapsed)).toBeGreaterThanOrEqual(runDelay);
    });

    it('cancel backoff with runner that do support cancellation', async () => {
      const retriesToCancel = 3;
      const runDelay = 20;
      let elapsed = 0;
      let retries = 0;
      backoffRunner = async token => {
        const sw = StopWatch.create();
        if (retries === retriesToCancel) {
          setTimeout(() => request.cancel(), runDelay / 2);
        }
        try {
          await timeout(runDelay, token);
        } catch (e) {
          // ignore cancel error
        }
        if (retries === retriesToCancel) {
          elapsed = sw.elapsed();
        }
        return Promise.reject('rejected');
      };
      backoffOptions.initialDelay = 1;
      backoffOptions.retry = () => ++retries;

      const request = initBackoff();
      request.catch(e => expect(e.message).toMatch(/Canceled/));

      expect(request.isCanceled()).toBe(false);
      await timeout(200);
      expect(request.isCanceled()).toBe(true);
      expect(retries).toBe(retriesToCancel + 1);

      expect(Math.round(elapsed)).toBeGreaterThanOrEqual(runDelay / 2);
      expect(Math.round(elapsed)).toBeLessThan(runDelay);
    });
  });
});
