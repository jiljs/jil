/**
 * Shallow merges previous and next objects into a new object using object spread.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeObject<T extends Record<any, any>>(prev: T, next: T): T {
  return {...prev, ...next};
}
