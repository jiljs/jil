import {AChainedError, BChainedError, CChainedError} from './fixtures/errors';
import {CausedError} from '../../errors/caused';

describe('CausedError', function () {
  it('is instanceof Error', () => {
    const causedError = new AChainedError('m');
    expect(causedError).toBeInstanceOf(Error);
  });

  it('is instanceof CausedError', () => {
    const causedError = new AChainedError('m');
    expect(causedError).toBeInstanceOf(CausedError);
  });

  it('initiate with only error', function () {
    const error = new Error('foo');
    const causedError = new CausedError(error.message, {cause: error});
    expect(causedError.cause).toEqual(error);
    expect(causedError.message).toEqual(error.message);
  });

  describe('with single cause', () => {
    function thrower() {
      throw new AChainedError('Error in thrower');
    }

    function rethrower() {
      try {
        thrower();
      } catch (error) {
        throw new BChainedError('Error in re-thrower', {cause: error});
      }
    }

    it('cause is instance of specified error', done => {
      try {
        rethrower();
      } catch (e) {
        expect(e).toBeInstanceOf(BChainedError);
        expect(e).toHaveProperty('cause');
        done();
      }
    });

    it("stack contains cause with it's stack", done => {
      try {
        rethrower();
      } catch (e) {
        expect(e).toBeInstanceOf(BChainedError);
        expect(e).toHaveProperty('stack');
        expect(e.stack).toMatch(/CAUSE: Error: Error in thrower/);
        done();
      }
    });
  });

  describe('with stacked causes', () => {
    function thrower() {
      throw new AChainedError('Error in thrower');
    }

    function rethrower1() {
      try {
        thrower();
      } catch (error) {
        throw new BChainedError('Error in rethrower1', {cause: error});
      }
    }

    function rethrower2() {
      try {
        rethrower1();
      } catch (error) {
        throw new CChainedError('Error in rethrower2', {cause: error});
      }
    }

    it("stack contains two causes with it's stack", done => {
      try {
        rethrower2();
      } catch (e) {
        expect(e).toBeInstanceOf(CChainedError);
        expect(e).toHaveProperty('stack');
        expect(e.stack).toMatch(/Error in thrower/);
        expect(e.stack).toMatch(/CAUSE: Error: Error in rethrower1/);
        done();
      }
    });
  });
});
