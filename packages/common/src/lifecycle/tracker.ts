/* eslint-disable @typescript-eslint/no-explicit-any */

import {Disposable} from './disposable';

/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
 */
const TRACK_DISPOSABLES = false;
let disposableTracker: IDisposableTracker | null = null;

export interface IDisposableTracker {
  /**
   * Is called on construction of a disposable.
   */
  trackDisposable(disposable: Disposable): void;

  /**
   * Is called when a disposable is registered as child of another disposable (e.g. {@link DisposableStore}).
   * If parent is `null`, the disposable is removed from its former parent.
   */
  setParent(child: Disposable, parent: Disposable | null): void;

  /**
   * Is called after a disposable is disposed.
   */
  markAsDisposed(disposable: Disposable): void;

  /**
   * Indicates that the given object is a singleton which does not need to be disposed.
   */
  markAsSingleton(disposable: Disposable): void;
}

export function setDisposableTracker(tracker: IDisposableTracker | null): void {
  disposableTracker = tracker;
}

if (TRACK_DISPOSABLES) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const __is_disposable_tracked__ = '__is_disposable_tracked__';
  setDisposableTracker(
    new (class implements IDisposableTracker {
      trackDisposable(x: Disposable): void {
        const stack = new Error('Potentially leaked disposable').stack!;
        setTimeout(() => {
          if (!(x as any)[__is_disposable_tracked__]) {
            console.log(stack);
          }
        }, 3000);
      }

      setParent(child: Disposable, parent: Disposable | null): void {
        if (child && child !== Disposable.None) {
          try {
            (child as any)[__is_disposable_tracked__] = true;
          } catch {
            // noop
          }
        }
      }

      markAsDisposed(disposable: Disposable): void {
        if (disposable && disposable !== Disposable.None) {
          try {
            (disposable as any)[__is_disposable_tracked__] = true;
          } catch {
            // noop
          }
        }
      }

      markAsSingleton(disposable: Disposable): void {}
    })(),
  );
}

export function trackDisposable<T extends Disposable>(x: T): T {
  disposableTracker?.trackDisposable(x);
  return x;
}

export function markAsDisposed(disposable: Disposable): void {
  disposableTracker?.markAsDisposed(disposable);
}

/**
 * Indicates that the given object is a singleton which does not need to be disposed.
 */
export function markAsSingleton<T extends Disposable>(singleton: T): T {
  disposableTracker?.markAsSingleton(singleton);
  return singleton;
}

export function setParentOfDisposable(child: Disposable, parent: Disposable | null): void {
  disposableTracker?.setParent(child, parent);
}

export function setParentOfDisposables(children: Disposable[], parent: Disposable | null): void {
  if (!disposableTracker) {
    return;
  }
  for (const child of children) {
    disposableTracker.setParent(child, parent);
  }
}
