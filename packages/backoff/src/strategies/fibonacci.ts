import { BackoffStrategy } from "../strategy";

export class FibonacciBackoffStrategy extends BackoffStrategy {
  protected currentDelay = 0;
  protected nextDelay = this.initialDelay;

  reset(): void {
    this.currentDelay = 0;
    this.nextDelay = this.initialDelay;
  }

  protected calcNext(): number {
    const result = Math.min(this.nextDelay, this.maxDelay);
    this.nextDelay += this.currentDelay;
    return this.currentDelay = result;
  }
}
