import {SingleOption} from '@jil/args';
import {createOptionDecorator} from '../metadata/createOptionDecorator';
import {PartialConfig} from '../types';

/**
 * A property decorator for declaring a command line option with a string value.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function String(description: string, config?: PartialConfig<SingleOption<string>>): PropertyDecorator {
  return createOptionDecorator<SingleOption<string>>({
    ...config,
    description,
    type: 'string',
  });
}
