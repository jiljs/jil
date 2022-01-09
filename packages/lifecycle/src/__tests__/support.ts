import {Disposable, setDisposableTracker} from '../disposable';

// let currentSpecResult: jasmine.CustomReporterResult;
//
// jasmine.getEnv().addReporter({
//   specStarted: (result) => {
//     currentSpecResult = result
//   },
// });

// export function getCurrentSpecResult() {
//   return currentSpecResult;
// }

interface DisposableData {
  source: string | null;
  parent: Disposable | null;
  isSingleton: boolean;
}

class DisposableTracker implements DisposableTracker {
  private readonly livingDisposables = new Map<Disposable, DisposableData>();

  private getDisposableData(d: Disposable) {
    let val = this.livingDisposables.get(d);
    if (!val) {
      val = {parent: null, source: null, isSingleton: false};
      this.livingDisposables.set(d, val);
    }
    return val;
  }

  trackDisposable(d: Disposable): void {
    const data = this.getDisposableData(d);
    if (!data.source) {
      data.source = new Error().stack!;
    }
  }

  setParent(child: Disposable, parent: Disposable | null): void {
    const data = this.getDisposableData(child);
    data.parent = parent;
  }

  markAsDisposed(x: Disposable): void {
    this.livingDisposables.delete(x);
  }

  markAsSingleton(disposable: Disposable): void {
    this.getDisposableData(disposable).isSingleton = true;
  }

  private getRootParent(data: DisposableData, cache: Map<DisposableData, DisposableData>): DisposableData {
    const cacheValue = cache.get(data);
    if (cacheValue) {
      return cacheValue;
    }

    const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
    cache.set(data, result);
    return result;
  }

  ensureNoLeakingDisposables() {
    const rootParentCache = new Map<DisposableData, DisposableData>();
    const leaking = [...this.livingDisposables.values()].filter(
      v => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton,
    );

    if (leaking.length > 0) {
      const count = 10;
      const firstLeaking = leaking.slice(0, count);
      const remainingCount = leaking.length - count;

      const separator = '--------------------\n\n';
      let s = firstLeaking.map(l => l.source).join(separator);
      if (remainingCount > 0) {
        s += `${separator}+ ${remainingCount} more`;
      }

      throw new Error(`These disposables were not disposed:\n${s}`);
    }
  }
}
/**
 * Use this function to ensure that all disposables are cleaned up at the end of each test in the current suite.
 *
 * Use `markAsSingleton` if disposable singletons are created lazily that are allowed to outlive the test.
 * Make sure that the singleton properly registers all child disposables so that they are excluded too.
 */
export function ensureNoDisposablesAreLeakedInTestSuite() {
  let tracker: DisposableTracker | undefined;
  beforeEach(() => {
    tracker = new DisposableTracker();
    setDisposableTracker(tracker);
  });

  afterEach(function () {
    setDisposableTracker(null);

    // if (!getCurrentSpecResult.length) {
    tracker!.ensureNoLeakingDisposables();
    // }
  });
}

export function throwIfDisposablesAreLeaked(body: () => void): void {
  const tracker = new DisposableTracker();
  setDisposableTracker(tracker);
  body();
  setDisposableTracker(null);
  tracker.ensureNoLeakingDisposables();
}
