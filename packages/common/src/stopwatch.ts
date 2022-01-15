/* eslint-disable @typescript-eslint/no-explicit-any */

declare const global: unknown;
declare const self: unknown;

const globals: any = typeof self === 'object' ? self : typeof global === 'object' ? global : {};

const hasPerformanceNow = globals.performance && typeof globals.performance.now === 'function';

export class StopWatch {
  private readonly _highResolution: boolean;
  private readonly _startTime: number;
  private _stopTime: number;

  public static create(highResolution = true): StopWatch {
    return new StopWatch(highResolution);
  }

  constructor(highResolution: boolean) {
    this._highResolution = hasPerformanceNow && highResolution;
    this._startTime = this._now();
    this._stopTime = -1;
  }

  public stop(): void {
    this._stopTime = this._now();
  }

  public elapsed(): number {
    if (this._stopTime !== -1) {
      return this._stopTime - this._startTime;
    }
    return this._now() - this._startTime;
  }

  private _now(): number {
    return this._highResolution ? globals.performance.now() : Date.now();
  }
}
