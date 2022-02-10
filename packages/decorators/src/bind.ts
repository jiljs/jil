import {isMethod} from './utils/is-method';

/**
 * A method decorator that automatically binds a class method's
 * `this` context to its current instance.
 */
export function bind(): MethodDecorator {
  return (target, property, descriptor) => {
    if (
      process.env.NODE_ENV !== 'production' &&
      (!isMethod(target, property, descriptor) || !('value' in descriptor && typeof descriptor.value === 'function'))
    ) {
      throw new TypeError(`\`@bind\` may only be applied to class methods.`);
    }

    const func = descriptor.value;

    return {
      configurable: true,
      get(this: Function) {
        const bound = (func as unknown as Function).bind(this);

        // Only cache the bound function when in the deepest sub-class,
        // otherwise any `super` calls will overwrite each other.
        if (target.constructor.name === this.constructor.name) {
          Object.defineProperty(this, property, {
            configurable: true,
            value: bound,
            writable: true,
          });
        }

        return bound;
      },
    };
  };
}
