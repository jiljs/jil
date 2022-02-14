import {Contract} from '@jil/common/contract';
import {Emitter} from '@jil/common/event/emitter';
import {BailEmitter} from '@jil/common/event/bail.emitter';
import {STATUS_FAILED, STATUS_PASSED, STATUS_PENDING, STATUS_RUNNING, STATUS_SKIPPED} from './constants';
import {Context} from './context';
import {PipelineError} from './errors';
import {Action, Hierarchical, Runnable, Status} from './types';
import isString from 'tily/is/string';

export abstract class WorkUnit<Options extends object, Input = unknown, Output = Input>
  extends Contract<Options>
  implements Runnable<Input, Output>, Hierarchical
{
  depth = 0;

  index = 0;

  output?: Output;

  input?: Input;

  startTime = 0;

  statusText = '';

  stopTime = 0;

  protected _onFail = new Emitter<[Error | null, Input]>();
  protected _onPass = new Emitter<[Output, Input]>();
  protected _onRun = new BailEmitter<Input>();
  protected _onSkip = new Emitter<Input>();

  /**
   * Called when an execution fails.
   * @category Events
   */
  readonly onFail = this._onFail.event;

  /**
   * Called when an execution succeeds.
   * @category Events
   */
  readonly onPass = this._onPass.event;

  /**
   * Called before a work unit is executed. Can return `true` to skip the work unit.
   * @category Events
   */
  readonly onRun = this._onRun.event;

  /**
   * Called when an execution is skipped.
   * @category Events
   */
  readonly onSkip = this._onSkip.event;

  readonly title: string;

  private readonly action: Action<Context, Input, Output>;

  private status: Status = STATUS_PENDING;

  // We want to support all contexts, so we use any.
  // Unknown and `Context` will not work because of the constraint.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(title: string, action: Action<any, Input, Output>, options?: Options) {
    super(options);

    if (!title || !isString(title)) {
      throw new PipelineError('WORK_REQUIRED_TITLE');
    }

    if (action !== null && typeof action !== 'function') {
      throw new PipelineError('ACTION_REQUIRED');
    }

    this.action = action;
    this.status = STATUS_PENDING;
    this.title = title;
  }

  /**
   * Return a unique hierarchical ID.
   */
  get id() {
    return `work[${this.depth}:${this.index}]`;
  }

  /**
   * Return true if the task failed when executing.
   */
  hasFailed(): boolean {
    return this.status === STATUS_FAILED;
  }

  /**
   * Return true if the task executed successfully.
   */
  hasPassed(): boolean {
    return this.status === STATUS_PASSED;
  }

  /**
   * Return true if the task has been completed in any form.
   */
  isComplete(): boolean {
    return this.hasPassed() || this.hasFailed() || this.isSkipped();
  }

  /**
   * Return true if the task has not been executed yet.
   */
  isPending(): boolean {
    return this.status === STATUS_PENDING;
  }

  /**
   * Return true if the task is currently running.
   */
  isRunning(): boolean {
    return this.status === STATUS_RUNNING;
  }

  /**
   * Return true if the task was or will be skipped.
   */
  isSkipped(): boolean {
    return this.status === STATUS_SKIPPED;
  }

  /**
   * Run the current task by executing it and performing any before and after processes.
   */
  async run(context: Context, value: Input): Promise<Output> {
    this.input = value;
    const skip = this._onRun.emit(value);
    const runner: Action<Context, Input, Output> = this.action;

    if (skip || this.isSkipped() || !runner) {
      this.status = STATUS_SKIPPED;
      this._onSkip.emit(value);

      // Allow input as output. This is problematic for skipping
      // since the expected output is no longer in sync. Revisit.
      // @ts-expect-error Allow invalid type
      return value;
    }

    this.status = STATUS_RUNNING;
    this.startTime = Date.now();

    try {
      this.output = await runner(context, value, this);
      this.status = STATUS_PASSED;
      this.stopTime = Date.now();
      this._onPass.emit([this.output, value]);
    } catch (error: unknown) {
      this.status = STATUS_FAILED;
      this.stopTime = Date.now();

      if (error instanceof Error) {
        this._onFail.emit([error, value]);

        throw error;
      }
    }

    this.statusText = '';

    return this.output!;
  }

  /**
   * Mark a task as skipped if the condition is true.
   */
  skip(condition = true): this {
    if (condition) {
      this.status = STATUS_SKIPPED;
    }

    return this;
  }
}
