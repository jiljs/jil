import {Path} from '@jil/ncommon';
import {requireModule} from '@jil/module';

export async function loadCjs<T>(path: Path): Promise<T> {
  return requireModule(path).default as T;
}
