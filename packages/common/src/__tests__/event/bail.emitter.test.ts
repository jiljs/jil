import {Event} from '../../event';
import {BailEmitter} from '../../event/bail.emitter';

describe('BailEmitter', function () {
  let emitter: BailEmitter<[string, number]>;
  let event: Event<[string, number]>;

  beforeEach(() => {
    emitter = new BailEmitter();
    event = emitter.event;
  });

  it('executes listeners in order', () => {
    let output = '';

    event(([value]) => {
      output += value;
      output += 'B';
    });
    event(() => {
      output += 'C';
    });
    event(() => {
      output += 'D';
    });

    const result = emitter.emit(['A', 0]);

    expect(result).toBe(false);
    expect(output).toBe('ABCD');
  });

  it('bails the loop if a listener returns false', () => {
    let count = 0;

    event(() => {
      count += 1;
    });
    event(() => {
      count += 1;

      return false;
    });
    event(() => {
      count += 1;
    });

    const result = emitter.emit(['', 0]);

    expect(result).toBe(true);
    expect(count).toBe(2);
  });

  it('doesnt bail the loop if a listener returns true', () => {
    let count = 0;

    event(([string, number]) => {
      count += number;
      count += 1;
    });
    event(() => {
      count += 1;

      return true;
    });
    event(() => {
      count += 1;
    });

    const result = emitter.emit(['', 1]);

    expect(result).toBe(false);
    expect(count).toBe(4);
  });
});
