import { Blueprint, Schemas } from '@jil/common/optimal';
import { normalizeSeparators } from '@jil/common-node/mocks';
import { getFixturePath } from '@jil/testlab';
import { Configuration, createExtendsSchema } from '..';
import { ExtendsSetting, ExtType } from '../types';
import { mockSystemPath } from './support';
import { mergeExtends } from '../utils/merge-extends';

interface JilConfig {
	debug: boolean;
	extends: ExtendsSetting;
	type: ExtType;
}

class JilConfiguration extends Configuration<JilConfig> {
	blueprint({ bool, string }: Schemas): Blueprint<JilConfig> {
		return {
			debug: bool(),
			extends: createExtendsSchema(),
			type: string('js').oneOf<ExtType>(['js', 'cjs', 'mjs', 'json', 'yaml', 'yml']),
		};
	}

	override bootstrap() {
		this.configureFinder({
			extendsSetting: 'extends',
		});

		this.configureProcessor({
			defaultWhenUndefined: false,
		});

		this.addProcessHandler('extends', mergeExtends);
	}
}

describe('Configuration', () => {
	let config: JilConfiguration;

	beforeEach(() => {
		config = new JilConfiguration('jil');
	});

	it('can pass a custom resolver', () => {
		const resolver = jest.fn();

		config = new JilConfiguration('jil', resolver);

		// @ts-expect-error Allow access
		expect(config.configFinder.options.resolver).toBe(resolver);
	});

	describe('clearCache()', () => {
		it('clears file and finder cache on cache engine', () => {
			// @ts-expect-error Allow access
			const spy1 = jest.spyOn(config.cache, 'clearFileCache');
			// @ts-expect-error Allow access
			const spy2 = jest.spyOn(config.cache, 'clearFinderCache');

			config.clearCache();

			expect(spy1).toHaveBeenCalled();
			expect(spy2).toHaveBeenCalled();
		});
	});

	describe('clearFileCache()', () => {
		it('clears file cache on cache engine', () => {
			// @ts-expect-error Allow access
			const spy = jest.spyOn(config.cache, 'clearFileCache');

			config.clearFileCache();

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('clearFinderCache()', () => {
		it('clears finder cache on cache engine', () => {
			// @ts-expect-error Allow access
			const spy = jest.spyOn(config.cache, 'clearFinderCache');

			config.clearFinderCache();

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('loadConfigFromBranchToRoot()', () => {
		it('loads and processes all configs', async () => {
			const loadSpy = jest.fn((c) => c);
			const processSpy = jest.fn();
			const tempRoot = getFixturePath('config-file-tree-all-types');

			config.onLoadedConfig(loadSpy);
			config.onProcessedConfig(processSpy);

			const result = await config.loadConfigFromBranchToRoot(
				normalizeSeparators(`${tempRoot}/src/app/profiles/settings`),
			);
			const expected = {
				config: {
					debug: true,
					extends: [],
					type: 'yaml',
				},
				files: [
					{
						config: { debug: true },
						path: mockSystemPath(`${tempRoot}/.config/jil.json`),
						source: 'root',
					},
					{
						config: { type: 'json' },
						path: mockSystemPath(`${tempRoot}/src/.jil.json`),
						source: 'branch',
					},
					{
						config: { type: 'cjs' },
						path: mockSystemPath(`${tempRoot}/src/app/.jil.cjs`),
						source: 'branch',
					},
					{
						config: { type: 'js' },
						path: mockSystemPath(`${tempRoot}/src/app/profiles/.jil.js`),
						source: 'branch',
					},
					{
						config: { type: 'yaml' },
						path: mockSystemPath(`${tempRoot}/src/app/profiles/settings/.jil.yaml`),
						source: 'branch',
					},
				],
			};

			expect(result).toEqual(expected);
			expect(loadSpy).toHaveBeenCalledWith(expected.files);
			expect(loadSpy).toHaveReturnedWith(expected.files);
			expect(processSpy).toHaveBeenCalledWith(expected.config);
		});
	});

	describe('loadConfigFromRoot()', () => {
		it('loads and processes root config', async () => {
			const loadSpy = jest.fn((c) => c);
			const processSpy = jest.fn();
			const tempRoot = getFixturePath('config-root-config-json');

			config.onLoadedConfig(loadSpy);
			config.onProcessedConfig(processSpy);

			const result = await config.loadConfigFromRoot(tempRoot);
			const expected = {
				config: {
					debug: true,
					extends: [],
					type: 'js',
				},
				files: [
					{
						config: { debug: true },
						path: mockSystemPath(`${tempRoot}/.config/jil.json`),
						source: 'root',
					},
				],
			};

			expect(result).toEqual(expected);
			expect(loadSpy).toHaveBeenCalledWith(expected.files);
			expect(loadSpy).toHaveReturnedWith(expected.files);
			expect(processSpy).toHaveBeenCalledWith(expected.config);
		});
	});

	describe('loadIgnoreFromBranchToRoot()', () => {
		it('loads all ignores', async () => {
			const spy = jest.fn((c) => c);
			const tempRoot = getFixturePath('config-ignore-file-tree');

			config.onLoadedIgnore(spy);

			const result = await config.loadIgnoreFromBranchToRoot(
				normalizeSeparators(`${tempRoot}/src/app/feature/signup/flow`),
			);
			const expected = [
				{
					ignore: ['*.log', '*.lock'],
					path: mockSystemPath(`${tempRoot}/.jilignore`),
					source: 'root',
				},
				{
					ignore: ['lib/'],
					path: mockSystemPath(`${tempRoot}/src/app/feature/.jilignore`),
					source: 'branch',
				},
				{
					ignore: [],
					path: mockSystemPath(`${tempRoot}/src/app/feature/signup/.jilignore`),
					source: 'branch',
				},
			];

			expect(result).toEqual(expected);
			expect(spy).toHaveBeenCalledWith(expected);
			expect(spy).toHaveReturnedWith(expected);
		});
	});

	describe('loadIgnoreFromRoot()', () => {
		it('loads root ignore', async () => {
			const spy = jest.fn((c) => c);
			const tempRoot = getFixturePath('config-ignore-file-tree');

			config.onLoadedIgnore(spy);

			const result = await config.loadIgnoreFromRoot(tempRoot);
			const expected = [
				{
					ignore: ['*.log', '*.lock'],
					path: mockSystemPath(`${tempRoot}/.jilignore`),
					source: 'root',
				},
			];

			expect(result).toEqual(expected);
			expect(spy).toHaveBeenCalledWith(expected);
			expect(spy).toHaveReturnedWith(expected);
		});
	});
});
