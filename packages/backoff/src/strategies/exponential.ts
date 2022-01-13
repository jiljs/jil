import {BackoffStrategy} from '../strategy';

export class ExponentialBackoffStrategy extends BackoffStrategy {
  protected currentDelay = 0;
  protected nextDelay = this.initialDelay;

  reset(): void {
    this.currentDelay = 0;
    this.nextDelay = this.initialDelay;
  }

  protected calcNext(): number {
    this.currentDelay = Math.min(this.nextDelay, this.maxDelay);
    this.nextDelay = this.currentDelay * this.options.factor;
    return this.currentDelay;
  }
}
