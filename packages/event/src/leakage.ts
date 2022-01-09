// eslint-disable-next-line @typescript-eslint/naming-convention
let _globalLeakWarningThreshold = -1;

export function setGlobalLeakWarningThreshold(n: number): () => void {
  const oldValue = _globalLeakWarningThreshold;
  _globalLeakWarningThreshold = n;
  return () => {
    _globalLeakWarningThreshold = oldValue;
  };
}

export class LeakageMonitor {
  private _stacks: Map<string, number> | undefined;
  private _warnCountdown = 0;

  constructor(readonly customThreshold?: number, readonly name: string = Math.random().toString(18).slice(2, 5)) {}

  dispose(): void {
    if (this._stacks) {
      this._stacks.clear();
    }
  }

  check(listenerCount: number): undefined | (() => void) {
    let threshold = _globalLeakWarningThreshold;
    if (typeof this.customThreshold === 'number') {
      threshold = this.customThreshold;
    }

    if (threshold <= 0 || listenerCount < threshold) {
      return undefined;
    }

    if (!this._stacks) {
      this._stacks = new Map();
    }
    const stack = new Error().stack!.split('\n').slice(3).join('\n');
    const count = this._stacks.get(stack) || 0;
    this._stacks.set(stack, count + 1);
    this._warnCountdown -= 1;

    if (this._warnCountdown <= 0) {
      // only warn on first exceed and then every time the limit
      // is exceeded by 50% again
      this._warnCountdown = threshold * 0.5;

      // find most frequent listener and print warning
      let topStack: string | undefined;
      let topCount = 0;
      // eslint-disable-next-line @typescript-eslint/no-shadow
      for (const [stack, count] of this._stacks) {
        if (!topStack || topCount < count) {
          topStack = stack;
          topCount = count;
        }
      }

      console.warn(
        `[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`,
      );
      console.warn(topStack!);
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const count = this._stacks!.get(stack) || 0;
      this._stacks!.set(stack, count - 1);
    };
  }
}
