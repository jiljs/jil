import resolve from 'resolve';
import {copyFixtureToNodeModule, getFixturePath, getNodeModulePath, normalizePath} from '@jil/testlab';
import {mockFilePath, mockModulePath} from '../mocks';
import {PathResolver} from '../path-resolver';
import {Path} from '../path';

describe('PathResolver', () => {
  let resolver: PathResolver;

  beforeEach(() => {
    resolver = new PathResolver();
  });

  it('throws an error if no path is resolved', async () => {
    resolver.lookupNodeModule('foo-bar');
    resolver.lookupFilePath('foo/bar');
    resolver.lookupFilePath('bar/baz');
    resolver.lookupNodeModule('bar-baz');

    const error = `Failed to resolve a path using the following lookups (in order):
  - foo-bar (node module)
  - ${normalizePath(process.cwd(), 'foo/bar')} (file system)
  - ${normalizePath(process.cwd(), 'bar/baz')} (file system)
  - bar-baz (node module)
 [CMN:PATH_RESOLVE_LOOKUPS]`;

    await expect(() => resolver.resolvePath()).rejects.toThrow(new Error(error));
  });

  it('returns first resolved node module or file path', async () => {
    const cwd = getFixturePath('module-basic');

    resolver.lookupFilePath('qux.js', cwd); // Doesnt exist
    resolver.lookupNodeModule('@jil/unknown'); // Doesnt exist
    resolver.lookupFilePath('bar.js'); // Doesnt exist at this cwd
    resolver.lookupNodeModule('@jil/common'); // Exists

    expect(resolver.getLookupPaths()).toEqual([
      mockFilePath(cwd, 'qux.js').path(),
      '@jil/unknown',
      mockFilePath(process.cwd(), 'bar.js').path(),
      '@jil/common',
    ]);

    await expect(resolver.resolvePath()).resolves.toEqual(mockFilePath(resolve.sync('@jil/common')));
  });

  it('can utilize a custom resolver', async () => {
    resolver = new PathResolver(() => 'custom');
    resolver.lookupNodeModule('unknown'); // Exists

    await expect(resolver.resolve()).resolves.toEqual({
      originalSource: mockModulePath('unknown'),
      resolvedPath: mockFilePath('custom'),
      type: 'node-module',
    });
  });

  it('can utilize a custom async resolver', async () => {
    resolver = new PathResolver(() => Promise.resolve('custom'));
    resolver.lookupNodeModule('unknown'); // Exists

    await expect(resolver.resolve()).resolves.toEqual({
      originalSource: mockModulePath('unknown'),
      resolvedPath: mockFilePath('custom'),
      type: 'node-module',
    });
  });

  describe('file system', () => {
    it('returns first resolved path', async () => {
      const cwd = getFixturePath('module-basic');

      resolver.lookupFilePath('qux.js', cwd); // Doesnt exist
      resolver.lookupFilePath('bar.js', cwd); // Exists
      resolver.lookupFilePath('foo.js', cwd); // Exists

      await expect(resolver.resolve()).resolves.toEqual({
        originalSource: mockFilePath('bar.js'),
        resolvedPath: mockFilePath(cwd, 'bar.js'),
        type: 'file-system',
      });
    });

    it('supports a list of extensions', async () => {
      const cwd = getFixturePath('module-basic');

      resolver.lookupFilePathWithExts('bar', ['ts', 'tsx', 'jsx', 'js'], cwd);

      await expect(resolver.resolve()).resolves.toEqual({
        originalSource: mockFilePath('bar.js'),
        resolvedPath: mockFilePath(cwd, 'bar.js'),
        type: 'file-system',
      });

      expect(resolver.getLookupPaths()).toEqual([
        mockFilePath(cwd, 'bar.ts').path(),
        mockFilePath(cwd, 'bar.tsx').path(),
        mockFilePath(cwd, 'bar.jsx').path(),
        mockFilePath(cwd, 'bar.js').path(),
      ]);
    });

    it('supports a list of extensions with leading period', async () => {
      const cwd = getFixturePath('module-basic');

      resolver.lookupFilePathWithExts('bar', ['.ts', '.tsx', '.jsx', '.js'], cwd);

      await expect(resolver.resolve()).resolves.toEqual({
        originalSource: mockFilePath('bar.js'),
        resolvedPath: mockFilePath(cwd, 'bar.js'),
        type: 'file-system',
      });

      expect(resolver.getLookupPaths()).toEqual([
        mockFilePath(cwd, 'bar.ts').path(),
        mockFilePath(cwd, 'bar.tsx').path(),
        mockFilePath(cwd, 'bar.jsx').path(),
        mockFilePath(cwd, 'bar.js').path(),
      ]);
    });

    it('supports different cwds', async () => {
      const cwd = getFixturePath('module-basic');

      resolver.lookupFilePath('qux.js', cwd); // Doesnt exist
      resolver.lookupFilePath('bar.js'); // Doesnt exist at this cwd
      resolver.lookupFilePath('foo.js', cwd); // Exists

      await expect(resolver.resolvePath()).resolves.toEqual(mockFilePath(cwd, 'foo.js'));
    });

    it('works with completely different parent folders and file extensions', async () => {
      const src = new Path(__dirname, '..');

      resolver.lookupFilePath('qux.js', getFixturePath('module-basic')); // Doesnt exist
      resolver.lookupFilePath('bar.js', src); // Doesnt exist
      resolver.lookupFilePath('json.ts', src.append('serializers')); // Exists

      await expect(resolver.resolvePath()).resolves.toEqual(mockFilePath(src, 'serializers/json.ts'));
    });
  });

  describe('node modules', () => {
    it('returns first resolved module', async () => {
      resolver.lookupNodeModule('@jil/unknown'); // Doesnt exist
      resolver.lookupNodeModule('@jil/common'); // Exists
      resolver.lookupNodeModule('@jil/testlab'); // Exists

      await expect(resolver.resolve()).resolves.toEqual({
        originalSource: mockModulePath('@jil/common'),
        resolvedPath: mockFilePath(resolve.sync('@jil/common')),
        type: 'node-module',
      });
    });

    it('works with sub-paths', async () => {
      const unmock = copyFixtureToNodeModule('module-basic', 'test-module-path-resolver');

      resolver.lookupNodeModule('test-module-path-resolver/qux'); // Doesnt exist
      resolver.lookupNodeModule('test-module-path-resolver/bar'); // Exists (without extension)
      resolver.lookupNodeModule('test-module-path-resolver/foo.js'); // Exists

      await expect(resolver.resolvePath()).resolves.toEqual(
        mockFilePath(getNodeModulePath('test-module-path-resolver', 'bar.js')),
      );

      unmock();
    });
  });
});
