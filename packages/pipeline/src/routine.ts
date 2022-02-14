import execa, {ExecaChildProcess, Options as ExecaOptions} from 'execa';
import kebabCaseName from 'tily/string/kebabCaseName';
import split from 'split';
import {toArray} from 'tily/array/toArray';
import {createDebugger, Debugger} from '@jil/debug';
import {Emitter} from '@jil/common/event/emitter';
import {AggregatedPipeline} from './aggregated.pipeline';
import {ConcurrentPipeline} from './concurrent.pipeline';
import {Context} from './context';
import {debug} from './debug';
import {Monitor} from './monitor';
import {Pipeline} from './pipeline';
import {PipelineError} from './errors';
import {PooledOptions, PooledPipeline} from './pooled.pipeline';
import {AnyWorkUnit, Hierarchical} from './types';
import {WaterfallPipeline} from './waterfall.pipeline';
import {WorkUnit} from './workunit';

export interface ExecuteCommandOptions {
  wrap?: (process: ExecaChildProcess) => void;
  workUnit?: AnyWorkUnit;
}

export abstract class Routine<Output = unknown, Input = unknown, Options extends object = {}> extends WorkUnit<
  Options,
  Input,
  Output
> {
  readonly debug: Debugger;

  readonly key: string;

  protected _onCommand = new Emitter<[string, string[]]>();
  protected _onCommandData = new Emitter<[string, string]>();

  /**
   * Called after `execa` was executed.
   * @category Events
   */
  readonly onCommand = this._onCommand.event;

  /**
   * Called while a command is being executed.
   * @category Events
   */
  readonly onCommandData = this._onCommandData.event;

  protected monitorInstance: Monitor | null = null;

  constructor(key: string[] | string, title: string, options?: Options) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(title, (context, value) => this.execute(context, value), options);

    if (!key || key.length === 0 || (typeof key !== 'string' && !Array.isArray(key))) {
      throw new PipelineError('ROUTINE_INVALID_KEY');
    }

    this.key = toArray(key).map(kebabCaseName).join(':');
    this.debug = createDebugger(['routine', this.key]);

    debug('New routine created: %s (%s)', this.key, this.title);
  }

  /**
   * Execute a command with the given arguments and pass the results through a promise.
   */
  async executeCommand(
    command: string,
    args: string[],
    options: ExecaOptions & ExecuteCommandOptions = {},
  ) /* infer */ {
    const {wrap, workUnit, ...opts} = options;
    const stream = execa(command, args, opts);

    this._onCommand.emit([command, args]);

    // Push chunks to the reporter
    const unit = workUnit ?? this;
    const handler = (line: string) => {
      if (unit.isRunning()) {
        // Only capture the status when not empty
        if (line) {
          unit.statusText = line;
        }

        this._onCommandData.emit([command, line]);
      }
    };

    stream.stderr!.pipe(split()).on('data', handler);
    stream.stdout!.pipe(split()).on('data', handler);

    // Allow consumer to wrap functionality
    if (typeof wrap === 'function') {
      wrap(stream);
    }

    return stream;
  }

  /**
   * Create and return a `AggregatedPipeline`. This pipeline will execute all work units
   * in parallel without interruption. Returns an object with a list of errors and results
   * once all resolve.
   */
  createAggregatedPipeline<C extends Context, I = unknown, O = I>(context: C, value?: I) {
    return this.updateHierarchy(new AggregatedPipeline<C, I, O>(context, value));
  }

  /**
   * Create and return a `ConcurrentPipeline`. This pipeline will execute all work units
   * in parallel. Returns a list of values once all resolve.
   */
  createConcurrentPipeline<C extends Context, I = unknown, O = I>(context: C, value?: I) {
    return this.updateHierarchy(new ConcurrentPipeline<C, I, O>(context, value));
  }

  /**
   * Create and return a `PooledPipeline`. This pipeline will execute a distinct set of work units
   * in parallel without interruption, based on a max concurrency, until all work units have ran.
   * Returns a list of errors and results once all resolve.
   */
  createPooledPipeline<C extends Context, I = unknown, O = I>(context: C, value?: I, options?: PooledOptions) {
    return this.updateHierarchy(new PooledPipeline<C, I, O>(context, value, options));
  }

  /**
   * Create and return a `WaterfallPipeline`. This pipeline will execute each work unit one by one,
   * with the return value of the previous being passed to the next. Returns the final value once
   * all resolve.
   */
  createWaterfallPipeline<C extends Context, I = unknown>(context: C, value?: I) {
    return this.updateHierarchy(new WaterfallPipeline<C, I>(context, value));
  }

  /**
   * Set the monitor to pass to nested pipelines.
   */
  setMonitor(monitor: Monitor): this {
    this.monitorInstance = monitor;

    return this;
  }

  /**
   * Update the hierarchical depth when creating a nested pipeline.
   */
  protected updateHierarchy<P extends Hierarchical>(pipeline: P): P {
    // eslint-disable-next-line no-param-reassign
    pipeline.depth = this.depth + 1;

    if (this.monitorInstance && pipeline instanceof Pipeline) {
      pipeline.monitor(this.monitorInstance);
    }

    return pipeline;
  }

  /**
   * Execute the current routine and return a new value.
   */
  abstract execute(context: Context, value: Input): Promise<Output>;
}
