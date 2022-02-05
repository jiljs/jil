/* eslint-disable @typescript-eslint/no-unused-vars */

import {deprecate} from '../deprecate';

describe('@deprecate', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('marks a class as deprecated', () => {
    @deprecate()
    class Test {}

    expect(spy).toHaveBeenCalledWith('Class `Test` has been deprecated.');
  });

  it('marks a class as deprecated with a custom message', () => {
    @deprecate('Use something else!')
    class Test {}

    expect(spy).toHaveBeenCalledWith('Use something else!');
  });

  it('marks a method as deprecated', () => {
    class Test {
      @deprecate()
      static staticMethod() {}

      @deprecate()
      instMethod() {}
    }

    expect(spy).toHaveBeenCalledWith('Method `Test.staticMethod()` has been deprecated.');
    expect(spy).toHaveBeenCalledWith('Method `Test#instMethod()` has been deprecated.');
  });

  it('marks a method as deprecated with a custom message', () => {
    class Test {
      @deprecate('Use another static')
      static staticMethod() {}

      @deprecate('Use another instance')
      instMethod() {}
    }

    expect(spy).toHaveBeenCalledWith('Use another static');
    expect(spy).toHaveBeenCalledWith('Use another instance');
  });

  it('marks a property as deprecated', () => {
    class Test {
      @deprecate()
      static staticProp = 123;

      @deprecate()
      instProp = 'abc';
    }

    expect(spy).toHaveBeenCalledWith('Property `Test.staticProp` has been deprecated.');
    expect(spy).toHaveBeenCalledWith('Property `Test#instProp` has been deprecated.');
  });

  it('marks a property as deprecated with a custom message', () => {
    class Test {
      @deprecate('Use another static')
      static staticProp = 123;

      @deprecate('Use another instance')
      instProp = 'abc';
    }

    expect(spy).toHaveBeenCalledWith('Use another static');
    expect(spy).toHaveBeenCalledWith('Use another instance');
  });
});
