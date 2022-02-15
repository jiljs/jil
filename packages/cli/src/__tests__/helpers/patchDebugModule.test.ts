import debug from 'debug';
import {patchDebugModule} from '../../helpers/patchDebugModule';

describe('patchDebugModule()', () => {
  it('wraps `debug`', () => {
    // We need to set env var beforehand
    process.env.DEBUG = '*';

    const inst = debug('jilcli:test');
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const unpatch = patchDebugModule();

    debug.enable('jilcli:*');
    inst('Debugging');

    // console.error('  \x1B[32;1mjilcli:test \x1B[0mDebugging');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('jilcli:test Debugging'));
    // expect(spy).toHaveBeenCalledWith(expect.stringContaining('Debugging'), expect.stringContaining('ms'));

    unpatch();
    spy.mockRestore();
  });
});
