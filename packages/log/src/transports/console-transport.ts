import {LOG_LEVELS} from '../constants';
import * as formats from '../formats';
import {Transport} from '../transport';
import {LogItem, TransportOptions} from '../types';

export class ConsoleTransport extends Transport<TransportOptions> {
  constructor(options?: Partial<TransportOptions>) {
    super({
      format: formats.console,
      levels: LOG_LEVELS,
      ...options,
    });
  }

  write(message: string, item: LogItem) {
    console[item.level](message.trim());
  }
}
