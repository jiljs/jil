import {kebabCaseName} from 'tily/string/kebabCaseName';
import {Contract} from '@jil/common/contract';
import {Emitter} from '@jil/common/event/emitter';
import {createDebugger, Debugger} from '@jil/debug';
import {Context} from './context';
import {debug} from './debug';
import {Monitor} from './monitor';
import {Hierarchical} from './types';
import {WorkUnit} from './workunit';

export abstract class Pipeline<Options extends object, Ctx extends Context, Input, Output>
  extends Contract<Options>
  implements Hierarchical
{
  depth = 0;

  index = 0;

  readonly context: Ctx;

  readonly debug: Debugger;

  readonly value: Input;

  protected _onAfterRun = new Emitter();
  protected _onBeforeRun = new Emitter<Input>();
  protected _onRunWorkUnit = new Emitter<[WorkUnit<{}, Input, Output>, Input]>();

  /**
   * Called after the pipeline executes work units.
   * @category Events
   */
  readonly onAfterRun = this._onAfterRun.event;

  /**
   * Called before the pipeline executes work units.
   * @category Events
   */
  readonly onBeforeRun = this._onBeforeRun.event;

  /**
   * Called before a single work unit is executed.
   * @category Events
   */
  readonly onRunWorkUnit = this._onRunWorkUnit.event;

  protected monitorInstance: Monitor | null = null;

  protected work: WorkUnit<{}, Input, Output>[] = [];

  constructor(context: Ctx, value?: Input, options?: Options) {
    super(options);

    const {name} = this.constructor;

    this.context = context;
    this.debug = createDebugger(kebabCaseName(name));

    // This is technically invalid, but we want to allow optional values.
    // Luckily the input type defaults to `unknown`, so it forces consumers to validate.
    // @ts-expect-error Allow
    this.value = value;

    debug('New %S created', name);
  }

  /**
   * Return a unique hierarchical ID.
   */
  get id() {
    return `pipeline[${this.depth}:${this.index}]`;
  }

  /**
   * Return a list of registered work units for the current pipeline.
   */
  getWorkUnits(): WorkUnit<{}, Input, Output>[] {
    return this.work;
  }

  /**
   * Monitor all hierarchical pipelines, routines, and tasks being executed,
   * by listening to all applicable events.
   */
  monitor(monitor: Monitor): this {
    this.monitorInstance = monitor.monitor(this);

    return this;
  }
}
