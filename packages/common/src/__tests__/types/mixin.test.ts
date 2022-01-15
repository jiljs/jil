import {ObjectWithOptions} from './mocks/object';
import {LogMixin} from './mocks/log.mixin';

describe('mixin', function () {
  it('MixinTarget', function () {
    class Greeter extends LogMixin(ObjectWithOptions) {}

    const greeter = new Greeter();
    greeter.log('debug', 'debug');
    greeter.log('info', 'info');
    greeter.log('warn', 'warn');
    greeter.log('error', 'error');

    expect(greeter.logs).toEqual([
      {
        level: 'info',
        message: 'info',
      },
      {
        level: 'warn',
        message: 'warn',
      },
      {
        level: 'error',
        message: 'error',
      },
    ]);
  });
});
