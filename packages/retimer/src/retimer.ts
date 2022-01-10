/* eslint-disable @typescript-eslint/no-explicit-any */

import { time } from "./time";

export type RetimerRunner = (...args: any) => any;

export class Retimer {
  private _started: number;
  private _rescheduled: number;
  private _scheduled: number;
  private _triggered: boolean;
  private _timer: NodeJS.Timeout;
  private readonly _args: any[];
  private readonly _timerWrapper: () => void;

  constructor(runner: RetimerRunner, timeout: number, ...args: any[]) {
    this._started = time();
    this._rescheduled = 0;
    this._scheduled = timeout;
    this._args = args;
    this._triggered = false;

    this._timerWrapper = () => {
      if (this._rescheduled > 0) {
        this._scheduled = this._rescheduled - (time() - this._started);
        this.schedule(this._scheduled);
      } else {
        this._triggered = true;
        runner(...this._args);
      }
    };

    this._timer = setTimeout(this._timerWrapper, timeout);
  }

  reschedule(timeout: number) {
    if (!timeout) {
      timeout = this._scheduled;
    }
    const now = time();
    if ((now + timeout) - (this._started + this._scheduled) < 0) {
      clearTimeout(this._timer);
      this.schedule(timeout);
    } else if (!this._triggered) {
      this._started = now;
      this._rescheduled = timeout;
    } else {
      this.schedule(timeout);
    }
  }

  protected schedule(timeout: number) {
    this._triggered = false;
    this._started = time();
    this._rescheduled = 0;
    this._scheduled = timeout;
    this._timer = setTimeout(this._timerWrapper, timeout);
  }

  clear() {
    clearTimeout(this._timer);
  }
}

export function retimer(runner: RetimerRunner, timout: number, ...args: any[]) {
  return new Retimer(runner, timout, ...args);
}
