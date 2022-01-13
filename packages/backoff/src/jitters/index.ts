import {Jitter, JitterType} from '../jitter';
import {fullJitter} from './full';
import {noJitter} from './no';

export function buildJitter(jitter: JitterType | Jitter): Jitter {
  if (typeof jitter === 'function') {
    return jitter;
  }

  switch (jitter) {
    case 'full':
      return fullJitter;

    case 'none':
    default:
      return noJitter;
  }
}
