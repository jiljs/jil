/* eslint-disable no-await-in-loop */

import {Context} from './context';
import {debug} from './debug';
import {SerialPipeline} from './serial.pipeline';

export class WaterfallPipeline<Ctx extends Context, Input = unknown> extends SerialPipeline<{}, Ctx, Input> {
  /**
   * Execute the pipeline in sequential order with the output of each
   * work unit being passed to the next work unit in the chain.
   */
  async run(): Promise<Input> {
    const work = this.getWorkUnits();
    let value = this.root.value as Input;

    debug('Running %d as a waterfall', work.length);

    this._onBeforeRun.emit(value);

    for (const unit of work) {
      this._onRunWorkUnit.emit([unit, value]);

      value = await unit.run(this.context, value);
    }

    this._onAfterRun.emit(undefined);

    return value;
  }
}
