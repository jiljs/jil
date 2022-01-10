export function isThenable<T>(obj: unknown): obj is Promise<T> {
  return !!obj && typeof (obj as unknown as Promise<T>).then === 'function';
}
