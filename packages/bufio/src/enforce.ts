export function enforce(condition: unknown, name: string, type: string): asserts condition {
  if (!condition) {
    const err = new TypeError(`'${name}' must be a(n) ${type}.`);

    if (Error.captureStackTrace) Error.captureStackTrace(err, enforce);

    throw err;
  }
}
