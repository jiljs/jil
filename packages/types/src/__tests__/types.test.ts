import {Constructor} from '../types';

describe('types', function () {
  it('constructor', function () {
    interface IDemo {
      foo: string;
    }

    class Demo implements IDemo {
      foo = 'bar';
    }

    const DemoClass: Constructor<IDemo> = Demo;

    const demo = new DemoClass();
    expect(demo.foo).toEqual('bar');
  });
});
