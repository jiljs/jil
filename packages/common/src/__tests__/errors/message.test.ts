/* eslint-disable @typescript-eslint/no-explicit-any */

import {toErrorMessage} from '../../errors/message';

describe('message', () => {
  test('Get Error Message', function () {
    expect(toErrorMessage('Foo Bar')).toStrictEqual('Foo Bar');
    expect(toErrorMessage(new Error('Foo Bar'))).toStrictEqual('Foo Bar');

    const error: any = new Error();
    error.detail = {};
    error.detail.exception = {};
    error.detail.exception.message = 'Foo Bar';
    expect(toErrorMessage(error)).toStrictEqual('Foo Bar');
    expect(toErrorMessage(error, true)).toStrictEqual('Foo Bar');

    expect(toErrorMessage()).toBeTruthy();
    expect(toErrorMessage(null)).toBeTruthy();
    expect(toErrorMessage({})).toBeTruthy();

    try {
      throw new Error();
    } catch (e) {
      expect(toErrorMessage(e)).toStrictEqual('An unknown error occurred. Please consult the log for more details.');
      expect(toErrorMessage(e, true).length).toBeGreaterThan(
        'An unknown error occurred. Please consult the log for more details.'.length,
      );
    }
  });
});
