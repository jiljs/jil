import {Path} from '@jil/common-node';
import {requireTSModule} from '@jil/module';

export async function loadTs<T>(path: Path): Promise<T> {
  return requireTSModule(path).default as T;
}
