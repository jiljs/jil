import {Blueprint, Schemas} from 'optimal';

export type BlueprintFactory<T extends object> = (schemas: Schemas, onConstruction?: boolean) => Blueprint<T>;

export interface Optionable<T extends object = {}> {
  /** Validated and configured options. */
  readonly options: Readonly<Required<T>>;

  /**
   * Define an `optimal` blueprint in which to validate and build the
   * options object passed to the constructor, or when manual setting.
   */
  blueprint: BlueprintFactory<object>;
}
