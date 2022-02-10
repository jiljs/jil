import { Path } from '@jil/common-node';
import { requireTSModule } from '@jil/module';

// eslint-disable-next-line @typescript-eslint/require-await
export async function loadTs<T>(path: Path): Promise<T> {
	return requireTSModule(path).default as T;
}
