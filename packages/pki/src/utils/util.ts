export function assert(condition: unknown, msg = 'no additional info provided'): asserts condition {
  if (!condition) {
    throw new Error('Assertion Error: ' + msg);
  }
}

export function noop(..._args: unknown[]): void {}
