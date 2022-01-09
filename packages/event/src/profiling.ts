import {StopWatch} from '@jil/stopwatch';

export class EventProfiling {
  private static _idPool = 0;

  private readonly _name: string;
  private _stopWatch?: StopWatch;
  private _listenerCount = 0;
  private _invocationCount = 0;
  private _elapsedOverall = 0;

  constructor(name: string) {
    this._name = `${name}_${EventProfiling._idPool++}`;
  }

  start(listenerCount: number): void {
    this._stopWatch = new StopWatch(true);
    this._listenerCount = listenerCount;
  }

  stop(): void {
    if (this._stopWatch) {
      const elapsed = this._stopWatch.elapsed();
      this._elapsedOverall += elapsed;
      this._invocationCount += 1;

      console.info(
        `did EMIT ${this._name}: elapsed_ms: ${elapsed.toFixed(5)}, listener: ${
          this._listenerCount
        } (elapsed_overall: ${this._elapsedOverall.toFixed(2)}, invocations: ${this._invocationCount})`,
      );
      this._stopWatch = undefined;
    }
  }
}
