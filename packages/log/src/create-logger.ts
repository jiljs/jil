import {isObject} from 'tily/is/object';
import {LOG_LEVELS} from './constants';
import {Logger} from './logger';
import {LoggerFunction, LoggerOptions, LogLevel} from './types';

function pipeLog(logger: Logger, level?: LogLevel) {
  return (...args: unknown[]) => {
    let metadata = {};

    if (isObject(args[0])) {
      metadata = (args as object[]).shift()!;
    }

    const message = (args as string[]).shift()!;

    logger.log({
      args,
      level,
      message,
      metadata,
    });
  };
}

/**
 * Create and return a logger with any configured transports.
 */
export function createLogger(options: LoggerOptions): LoggerFunction {
  const logger = new Logger(options);
  const log = pipeLog(logger);

  LOG_LEVELS.forEach(level => {
    Object.defineProperty(log, level, {
      value: pipeLog(logger, level),
    });
  });

  Object.defineProperty(log, 'disable', {
    value: () => {
      logger.disable();
    },
  });

  Object.defineProperty(log, 'enable', {
    value: () => {
      logger.enable();
    },
  });

  return log as LoggerFunction;
}
