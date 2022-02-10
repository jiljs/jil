import {isMethod} from './utils/is-method';

/**
 * A method decorator that throttles the execution of a class method to
 * only fire once within every delay timeframe (in milliseconds).
 */
export function throttle(delay: number): MethodDecorator {
  return (target, property, descriptor) => {
    if (
      process.env.NODE_ENV !== 'production' &&
      (!isMethod(target, property, descriptor) || !('value' in descriptor && typeof descriptor.value === 'function'))
    ) {
      throw new TypeError(`\`@throttle\` may only be applied to class methods.`);
    }

    // We must use a map as all class instances would share the
    // same boolean value otherwise.
    const throttling = new WeakMap<Function, boolean>();

    // Overwrite the value function with a new throttled function
    const func = descriptor.value;

    // @ts-expect-error Override generic
    // eslint-disable-next-line @typescript-eslint/no-shadow
    descriptor.value = function throttle(this: Function, ...args: unknown[]) {
      if (throttling.get(this)) {
        return;
      }

      (func as unknown as Function).apply(this, args);
      throttling.set(this, true);

      setTimeout(() => {
        throttling.delete(this);
      }, delay);
    };
  };
}
