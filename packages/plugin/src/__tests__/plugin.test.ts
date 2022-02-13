import {Renderer} from './__fixtures__/renderer';

describe('Plugin', () => {
  it('accepts options in the constructor', () => {
    const plugin = new Renderer({value: 'foo'});

    expect(plugin.options).toEqual({value: 'foo'});
  });
});
