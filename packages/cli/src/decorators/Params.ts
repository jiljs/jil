import {MapParamConfig, ParamConfig, PrimitiveType} from '@jil/args';
import {registerParams} from '../metadata/registerParams';

/**
 * A method decorator for declaring command line parameters (positional arguments).
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Params<T extends PrimitiveType[] = string[]>(...config: MapParamConfig<T>): MethodDecorator {
  return (target, method) => {
    registerParams(target, method, config as ParamConfig[]);
  };
}
