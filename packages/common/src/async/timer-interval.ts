/* eslint-disable @typescript-eslint/no-explicit-any */

import {TimerRunner} from './types';

export class IntervalTimer {
  protected runner?: TimerRunner;
  private timer: any;

  constructor(runner?: TimerRunner, interval?: number) {
    this.timer = -1;
    this.runner = runner;
    if (typeof interval === 'number') {
      this.reschedule(interval);
    }
  }

  static schedule(runner?: TimerRunner, interval?: number) {
    return new IntervalTimer(runner, interval);
  }

  dispose(): void {
    this.cancel();
  }

  cancel(): this {
    if (this.timer !== -1) {
      clearInterval(this.timer);
      this.timer = -1;
    }
    return this;
  }

  reschedule(interval: number): void {
    if (!this.runner) {
      throw new Error('runner has not been set');
    }
    this.cancel();
    this.timer = setInterval(() => this.runner!(), interval);
  }
}

export function reinterval(runner?: TimerRunner, interval?: number) {
  return IntervalTimer.schedule(runner, interval);
}
