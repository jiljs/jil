import {isClass} from './utils/is-class';
import {isMethod} from './utils/is-method';
import {isParam} from './utils/is-param';
import {isProperty} from './utils/is-property';

/**
 * A decorator that marks a class declaration, class method,
 * class property, or method parameter as deprecated by
 * logging a deprecation message to the console.
 */
export function deprecate(message?: string) {
  return (target: Function | Object, property?: string | symbol, descriptor?: unknown): void => {
    const isProtoOrStatic = typeof target === 'function';
    const className = isProtoOrStatic ? target.name : target.constructor.name;
    const accessSymbol = isProtoOrStatic ? `.${String(property)}` : `#${String(property)}`;

    // Class
    if (isClass(target, property, descriptor)) {
      console.debug(message ?? `Class \`${className}\` has been deprecated.`);

      // Method
    } else if (isMethod(target, property, descriptor)) {
      console.debug(message ?? `Method \`${className + accessSymbol}()\` has been deprecated.`);

      // Property
    } else if (isProperty(target, property, descriptor)) {
      console.debug(message ?? `Property \`${className + accessSymbol}\` has been deprecated.`);

      // Param (Babel/Jest doesnt support them)
    } /* istanbul ignore next */ else if (isParam(target, property, descriptor)) {
      console.debug(message ?? `Parameter ${descriptor} for \`${className + accessSymbol}()\` has been deprecated.`);
    }
  };
}
