import {instance, shape, string, union} from '@jil/common/optimal';
import {Path} from './path';
import {PortablePath} from './types';

/**
 * A schema for validating a value is a `PortablePath`.
 * Checks for a string, `Path`, or `Pathable`.
 */
export const portablePathSchema = union<PortablePath>('').of([
  string(),
  instance().of(Path),
  instance().of(Path, {loose: true}),
  shape({
    path: string(),
  }),
]);
