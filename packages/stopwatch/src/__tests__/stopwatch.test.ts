import {StopWatch} from '../stopwatch';

describe('StopWatch', function () {
  it('should stop counting if stop has been called', async () => {
    const sw = StopWatch.create(true);
    await delay(10);
    sw.stop();
    const expected = sw.elapsed();
    await delay(10);
    expect(sw.elapsed()).toBe(expected);
  });

  it('should continue counting without stop', async () => {
    const sw = StopWatch.create(true);
    await delay(10);
    const expected = sw.elapsed();
    await delay(10);
    expect(sw.elapsed()).toBeGreaterThan(expected);
  });
});

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
