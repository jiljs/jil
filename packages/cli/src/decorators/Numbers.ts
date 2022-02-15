import {MultipleOption} from '@jil/args';
import {createOptionDecorator} from '../metadata/createOptionDecorator';
import {PartialConfig} from '../types';

/**
 * A property decorator for declaring a command line option with multiple numeric values.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Numbers(description: string, config?: PartialConfig<MultipleOption<number[]>>): PropertyDecorator {
  return createOptionDecorator<MultipleOption<number[]>>({
    ...config,
    default: [],
    description,
    multiple: true,
    type: 'number',
  });
}
