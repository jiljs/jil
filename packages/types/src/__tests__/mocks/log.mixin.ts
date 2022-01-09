import {MixinTarget} from '../../mixin';
import {ObjectWithOptions} from './object';

const LogLevels = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

export type LogLevel = keyof typeof LogLevels;

export interface LogItem {
  level: LogLevel;
  message: string;
}

export function LogMixin<T extends MixinTarget<ObjectWithOptions>>(superClass: T) {
  return class extends superClass {
    logLevel: LogLevel;

    logs: LogItem[];

    // A mixin class has to take in a type any[] argument!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.logLevel = this.options?.logLevel ?? 'info';
      this.logs = [];
    }

    log(level: LogLevel, message: string) {
      if (LogLevels[level] >= LogLevels[this.logLevel]) {
        this.logs.push({level, message});
      }
    }
  };
}
