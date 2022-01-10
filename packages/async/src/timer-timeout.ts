/* eslint-disable @typescript-eslint/no-explicit-any */

import {TimerRunner} from './types';

export class TimeoutTimer {
  protected runner?: TimerRunner;
  private timer: any;

  constructor(runner?: () => void, timeout?: number) {
    this.timer = -1;

    if (typeof runner === 'function' && typeof timeout === 'number') {
      this.setIfNotSet(runner, timeout);
    }
  }

  static schedule(runner?: TimerRunner, timeout?: number) {
    return new TimeoutTimer(runner, timeout);
  }

  dispose(): void {
    this.cancel();
  }

  cancel(): void {
    if (this.timer !== -1) {
      clearTimeout(this.timer);
      this.timer = -1;
    }
  }

  reschedule(timeout: number) {
    if (!this.runner) {
      throw new Error('runner has not been set');
    }
    this.cancel();
    this.timer = setTimeout(() => {
      this.timer = -1;
      this.runner!();
    }, timeout);
  }

  cancelAndSet(runner: () => void, timeout: number): void {
    this.runner = runner;
    this.reschedule(timeout);
  }

  setIfNotSet(runner: () => void, timeout: number): void {
    if (this.timer !== -1) {
      // timer is already set
      return;
    }
    this.runner = runner;
    this.reschedule(timeout);
  }
}

export function retimeout(runner?: TimerRunner, timeout?: number) {
  return TimeoutTimer.schedule(runner, timeout);
}
