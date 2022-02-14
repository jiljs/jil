import {Routine} from './routine';
import {AnyPipeline, AnyWorkUnit} from './types';
import {Emitter} from '@jil/common/event/emitter';
import {BailEmitter} from '@jil/common/event/bail.emitter';

export class Monitor {
  protected _onPipelineAfterRun = new Emitter<AnyPipeline>();
  protected _onPipelineBeforeRun = new Emitter<[AnyPipeline, unknown]>();
  protected _onPipelineRunWorkUnit = new Emitter<[AnyPipeline, AnyWorkUnit, unknown]>();
  protected _onWorkUnitFail = new Emitter<[AnyWorkUnit, Error | null, unknown]>();
  protected _onWorkUnitPass = new Emitter<[AnyWorkUnit, unknown, unknown]>();
  protected _onWorkUnitRun = new BailEmitter<[AnyWorkUnit, unknown]>();
  protected _onWorkUnitSkip = new Emitter<[AnyWorkUnit, unknown]>();

  /**
   * Called after a pipeline class has ran.
   * @category Events
   */
  readonly onPipelineAfterRun = this._onPipelineAfterRun.event;

  /**
   * Called before a pipeline class is ran.
   * @category Events
   */
  readonly onPipelineBeforeRun = this._onPipelineBeforeRun.event;

  /**
   * Called before a pipeline's work unit is executed.
   * @category Events
   */
  readonly onPipelineRunWorkUnit = this._onPipelineRunWorkUnit.event;

  /**
   * Called when any work unit has failed.
   * @category Events
   */
  readonly onWorkUnitFail = this._onWorkUnitFail.event;

  /**
   * Called when any work unit has passed.
   * @category Events
   */
  readonly onWorkUnitPass = this._onWorkUnitPass.event;

  /**
   * Called when any work unit is ran.
   * @category Events
   */
  readonly onWorkUnitRun = this._onWorkUnitRun.event;

  /**
   * Called when any work unit is skipped.
   * @category Events
   */
  readonly onWorkUnitSkip = this._onWorkUnitSkip.event;

  /**
   * Monitor events for the provided pipeline, its work units, and all other
   * pipelines and work units down the hierarchical tree.
   */
  monitor(pipeline: AnyPipeline): this {
    pipeline.onAfterRun(() => {
      this._onPipelineAfterRun.emit(pipeline);
    });

    pipeline.onBeforeRun(input => {
      this._onPipelineBeforeRun.emit([pipeline, input]);
    });

    pipeline.onRunWorkUnit(([workUnit, value]) => {
      if (workUnit instanceof Routine) {
        workUnit.setMonitor(this);
      }

      this._onPipelineRunWorkUnit.emit([pipeline, workUnit, value]);

      workUnit.onFail(([error, input]) => {
        this._onWorkUnitFail.emit([workUnit, error, input]);
      });

      workUnit.onPass(([output, input]) => {
        this._onWorkUnitPass.emit([workUnit, output, input]);
      });

      workUnit.onRun(input => {
        this._onWorkUnitRun.emit([workUnit, input]);
      });

      workUnit.onSkip(input => {
        this._onWorkUnitSkip.emit([workUnit, input]);
      });
    });

    return this;
  }
}
