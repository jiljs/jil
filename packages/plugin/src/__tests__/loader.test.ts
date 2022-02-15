import {Path} from '@jil/ncommon';
import {copyFixtureToNodeModule} from '@jil/testlab';
import {Loader} from '../loader';
import {createRendererRegistry, Renderable} from './__fixtures__/renderer';

describe('Loader', () => {
  let fixtures: Function[];
  let loader: Loader<Renderable>;

  beforeEach(() => {
    fixtures = [];
    loader = new Loader<Renderable>(createRendererRegistry());
  });

  afterEach(() => {
    fixtures.forEach(fixture => fixture());
  });

  describe('createResolver()', () => {
    describe('file paths', () => {
      it('adds unix absolute path', () => {
        const resolver = loader.createResolver('/foo/bar/baz.js');

        expect(resolver.getLookupPaths()).toEqual([
          process.platform === 'win32' ? 'D:\\foo\\bar\\baz.js' : '/foo/bar/baz.js',
        ]);
      });

      it('adds relative path', () => {
        const resolver = loader.createResolver('./bar/baz.js');

        expect(resolver.getLookupPaths()).toEqual([Path.resolve('./bar/baz.js').path()]);
      });
    });

    describe('private scope', () => {
      it('adds lookup if pattern matches', () => {
        const resolver = loader.createResolver('@scope/jil-test-renderer-test');

        expect(resolver.getLookupPaths()).toEqual(['@scope/jil-test-renderer-test']);
      });

      it('adds lookup for shorthand', () => {
        const resolver = loader.createResolver('@scope/test');

        expect(resolver.getLookupPaths()).toEqual(['@scope/jil-test-renderer-test']);
      });

      it('doesnt match if tool name wrong', () => {
        expect(() => {
          loader.createResolver('@scope/unknown-renderer-test');
        }).toThrow('Unknown plugin module format "@scope/unknown-renderer-test". [PLG:MODULE_UNKNOWN_FORMAT]');
      });

      it('doesnt match if plugin type wrong', () => {
        expect(() => {
          loader.createResolver('@scope/jil-test-plugin-test');
        }).toThrow('Unknown plugin module format "@scope/jil-test-plugin-test". [PLG:MODULE_UNKNOWN_FORMAT]');
      });
    });

    describe('internal scope', () => {
      it('adds lookup if pattern matches', () => {
        const resolver = loader.createResolver('@jil-test/renderer-test');

        expect(resolver.getLookupPaths()).toEqual(['@jil-test/renderer-test']);
      });

      it('doesnt match if tool name wrong', () => {
        expect(() => {
          loader.createResolver('@unknown/renderer-test');
        }).toThrow('Unknown plugin module format "@unknown/renderer-test". [PLG:MODULE_UNKNOWN_FORMAT]');
      });

      it('doesnt match if plugin type wrong', () => {
        expect(() => {
          loader.createResolver('@jil-test/plugin-test');
        }).toThrow('Unknown plugin module format "@jil-test/plugin-test". [PLG:MODULE_UNKNOWN_FORMAT]');
      });
    });

    describe('public scope', () => {
      it('adds lookup if pattern matches', () => {
        const resolver = loader.createResolver('jil-test-renderer-test');

        expect(resolver.getLookupPaths()).toEqual(['jil-test-renderer-test']);
      });

      it('doesnt match if tool name wrong', () => {
        expect(() => {
          loader.createResolver('unknown-renderer-test');
        }).toThrow('Unknown plugin module format "unknown-renderer-test". [PLG:MODULE_UNKNOWN_FORMAT]');
      });

      it('doesnt match if plugin type wrong', () => {
        expect(() => {
          loader.createResolver('jil-test-plugin-test');
        }).toThrow('Unknown plugin module format "jil-test-plugin-test". [PLG:MODULE_UNKNOWN_FORMAT]');
      });
    });

    describe('name only', () => {
      it('adds lookup for internal and public scopes', () => {
        const resolver = loader.createResolver('test');

        expect(resolver.getLookupPaths()).toEqual(['@jil-test/renderer-test', 'jil-test-renderer-test']);
      });

      it('supports dashes', () => {
        const resolver = loader.createResolver('foo-bar');

        expect(resolver.getLookupPaths()).toEqual(['@jil-test/renderer-foo-bar', 'jil-test-renderer-foo-bar']);
      });

      it('supports numbers', () => {
        const resolver = loader.createResolver('test123');

        expect(resolver.getLookupPaths()).toEqual(['@jil-test/renderer-test123', 'jil-test-renderer-test123']);
      });
    });
  });

  describe('load()', () => {
    it('errors if module is not found', async () => {
      await expect(loader.load('missing')).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Failed to resolve a path'),
        }),
      );
    });

    it('errors if module does not export a function', async () => {
      fixtures.push(copyFixtureToNodeModule('plugin-export-nonfunc', 'jil-test-renderer-nonfunc'));

      await expect(loader.load('nonfunc')).rejects.toThrow(
        'Plugin modules must export a default function, found object.',
      );
    });

    it('loads a plugin module that factories an object', async () => {
      fixtures.push(copyFixtureToNodeModule('plugin-renderer-object', 'jil-test-renderer-object'));

      const result = await loader.load('object');

      expect(result).toEqual({
        name: 'jil-test-renderer-object',
        options: {},
        render: expect.any(Function),
      });
    });

    it('loads a plugin module that factories an object with options', async () => {
      fixtures.push(copyFixtureToNodeModule('plugin-renderer-object', '@jil-test/renderer-object-extra'));

      const result = await loader.load('object-extra', {value: 'foo'});

      expect(result).toEqual({
        name: '@jil-test/renderer-object-extra',
        options: {value: 'foo'},
        render: expect.any(Function),
      });
    });

    it('loads a plugin module that factories a class instance', async () => {
      fixtures.push(copyFixtureToNodeModule('plugin-renderer-class', 'jil-test-renderer-class'));

      const result = await loader.load('class');

      expect(result).toEqual(
        expect.objectContaining({
          name: 'jil-test-renderer-class',
        }),
      );

      expect(result.constructor.name).toBe('Renderer');
    });

    it('loads a plugin module that factories a class instance with options', async () => {
      fixtures.push(copyFixtureToNodeModule('plugin-renderer-class', '@jil-test/renderer-class-extra'));

      const result = await loader.load('class-extra', {value: 'foo'});

      expect(result).toEqual(
        expect.objectContaining({
          name: '@jil-test/renderer-class-extra',
          options: {value: 'foo'},
        }),
      );

      expect(result.constructor.name).toBe('Renderer');
    });
  });
});
