import {Path} from '@jil/ncommon';
import {requireModule} from '@jil/module';

// eslint-disable-next-line @typescript-eslint/require-await
export async function loadCjs<T>(path: Path): Promise<T> {
  return requireModule(path).default as T;
}
