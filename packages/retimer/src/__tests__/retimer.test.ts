import {retimer} from '../retimer';

describe('retimer', () => {
  test('schedule a callback', done => {
    const start = Date.now();

    retimer(() => {
      expect(Date.now() - start).toBeGreaterThanOrEqual(50);
      done();
    }, 60);
  });

  test('reschedule a callback', done => {
    const start = Date.now();

    const timer = retimer(() => {
      expect(Date.now() - start).toBeGreaterThanOrEqual(70);
      done();
    }, 50);

    setTimeout(() => {
      timer.reschedule(50);
    }, 20);
  });

  test('reschedule multiple times', done => {
    const start = Date.now();

    const timer = retimer(() => {
      expect(Date.now() - start).toBeGreaterThanOrEqual(90);
      done();
    }, 50);

    setTimeout(() => {
      timer.reschedule(50);
      setTimeout(() => {
        timer.reschedule(50);
      }, 20);
    }, 20);
  });

  test('clear a timer', done => {
    const timer = retimer(() => {
      done.fail('the timer should never get called');
    }, 20);

    timer.clear();

    setTimeout(done, 50);
  });

  test('clear a timer after a reschedule', done => {
    const timer = retimer(() => {
      done.fail('the timer should never get called');
    }, 20);

    setTimeout(() => {
      timer.reschedule(50);
      setTimeout(() => {
        timer.clear();
      }, 10);
    }, 10);

    setTimeout(done, 50);
  });

  test('can be rescheduled early', done => {
    const start = Date.now();

    const timer = retimer(() => {
      expect(Date.now() - start).toBeLessThanOrEqual(500);
      done();
    }, 500);

    setTimeout(() => {
      timer.reschedule(10);
    }, 20);
  });

  test('can be rescheduled even if the timeout has already triggered', done => {
    const start = Date.now();
    let count = 0;

    const timer = retimer(() => {
      count++;
      if (count === 1) {
        expect(Date.now() - start).toBeGreaterThanOrEqual(20);
        timer.reschedule(20);
      } else {
        expect(Date.now() - start).toBeGreaterThanOrEqual(40);
        done();
      }
    }, 20);
  });

  test('pass arguments to the callback', done => {
    retimer(
      arg => {
        expect(arg).toEqual(42);
        done();
      },
      50,
      42,
    );
  });
});
