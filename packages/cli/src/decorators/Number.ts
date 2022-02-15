import {SingleOption} from '@jil/args';
import {createOptionDecorator} from '../metadata/createOptionDecorator';
import {PartialConfig} from '../types';

/**
 * A property decorator for declaring a command line option with a numeric value.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Number(description: string, config?: PartialConfig<SingleOption<number>>): PropertyDecorator {
  return createOptionDecorator<SingleOption<number>>({
    ...config,
    description,
    type: 'number',
  });
}
