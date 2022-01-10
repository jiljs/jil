import { Thenable } from "@jil/types";

export function isThenable<T>(obj: unknown): obj is Thenable<T> {
  return !!obj && typeof (obj as unknown as Thenable<T>).then === 'function';
}
