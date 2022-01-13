import {BackoffOptions, sanitizeOptions} from './options';
import {buildJitter} from './jitters';
import {Jitter} from './jitter';

export type BackoffStrategyType = 'exponential' | 'fibonacci';

export class BackoffStrategy {
  protected options: BackoffOptions;
  protected jitter: Jitter;

  constructor(options: Partial<BackoffOptions> = {}) {
    this.options = sanitizeOptions(options);
    this.jitter = buildJitter(this.options.jitter);
  }

  get initialDelay() {
    return this.options.initialDelay;
  }

  get maxDelay() {
    return this.options.maxDelay;
  }

  next() {
    return this.jitter(this.calcNext());
  }

  public reset(): void {
    throw new Error('Not implemented');
  }

  protected calcNext(): number {
    throw new Error('Not implemented');
  }
}

export type BackoffStrategyCtor = typeof BackoffStrategy;
