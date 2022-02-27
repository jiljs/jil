import {Path} from '@jil/ncommon';
import {requireTSModule} from '@jil/module';

export async function loadTs<T>(path: Path): Promise<T> {
  return requireTSModule(path).default as T;
}
