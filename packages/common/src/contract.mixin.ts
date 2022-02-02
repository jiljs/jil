/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from "optimal";
import { Blueprint, DeepPartial, optimal, Schemas } from "optimal";
import { isPlainObject } from "tily/is/plainObject";
import { last } from "tily/array/last";
import { MixinTarget } from "./types";

export const EmptyBlueprint = {};

export function ContractMixin<O extends object = {}, T extends MixinTarget<Object> = MixinTarget<Object>>(superClass: T) {
  return class extends superClass {

    /** Validated and configured options. */
    readonly options: Readonly<Required<O>>;

    constructor(...args: any[]) {
      super(...args);

      if (args.length > 0 && isPlainObject(last(args))) {
        this.configure(last(args));
      }
    }


    /**
     * Set an options object by merging the new partial and existing options
     * with the defined blueprint, while running all validation checks.
     * Freeze and return the options object.
     *
     * ```ts
     * object.configure({ name: 'Boost' });
     *
     * object.configure((prevOptions) => ({
     * 	nestedObject: {
     * 		...prevOptions.nestedObject,
     * 		some: 'value',
     * 	},
     * }));
     * ```
     */
    configure(options?: Partial<O> | ((options: Required<O>) => Partial<O>)): Readonly<Required<O>> {
      const nextOptions = typeof options === "function" ? options(this.options) : options;

      const blueprint = this.blueprint(t.schemas, this.options === undefined) as Blueprint<O>;

      if (blueprint) {
        // We don't want the "options" property to be modified directly,
        // so it's read only, but we still want to modify it with this function.
        // @ts-expect-error Allow readonly overwrite
        this["options"] = Object.freeze(
          optimal(blueprint, {
            name: this.constructor.name
          }).validate({ ...this.options, ...nextOptions } as DeepPartial<O>)
        );
      }

      return this.options;
    }

    /**
     * Define an `optimal` blueprint in which to validate and build the
     * options object passed to the constructor, or when manual setting.
     *
     * A boolean is passed as the 2nd argument to determine whether this is
     * validating on class instantiation (first time), or by calling
     * `configure()` (all other times).
     */
    blueprint(schemas: Schemas, onConstruction?: boolean): Blueprint<object> | undefined {
      return undefined;
    }
  };
}
