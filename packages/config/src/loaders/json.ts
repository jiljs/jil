import fs from 'fs';
import {json, Path} from '@jil/ncommon';

export async function loadJson<T>(path: Path): Promise<T> {
  return json.parse(await fs.promises.readFile(path.path(), 'utf8'));
}
