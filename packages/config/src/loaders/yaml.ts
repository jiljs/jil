import fs from 'fs';
import { Path, yaml } from '@jil/common-node';

export async function loadYaml<T>(path: Path): Promise<T> {
	return yaml.parse(await fs.promises.readFile(path.path(), 'utf8'));
}
