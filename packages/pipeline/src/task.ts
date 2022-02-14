import {Blueprint, Schemas} from '@jil/common/optimal';
import {WorkUnit} from './workunit';

export class Task<Input = unknown, Output = Input> extends WorkUnit<{}, Input, Output> {
  // A task is simply a work unit that executes a standard function.
  // It doesn't need configurable options, so implement an empty blueprint.
  blueprint(schemas: Schemas): Blueprint<object> {
    return {};
  }
}
