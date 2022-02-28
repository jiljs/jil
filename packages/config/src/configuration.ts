import {Contract} from '@jil/common/contract';
import {ModuleResolver, Path, PortablePath} from '@jil/ncommon';
import {Blueprint, schemas} from '@jil/common/optimal';
import {Emitter} from '@jil/common/event/emitter';
import {Cache} from './Cache';
import {ConfigFinder} from './ConfigFinder';
import {IgnoreFinder} from './IgnoreFinder';
import {Processor} from './Processor';
import {ConfigFile, ConfigFinderOptions, Handler, IgnoreFile, ProcessedConfig, ProcessorOptions} from './types';

export abstract class Configuration<T extends object> extends Contract<T> {
  readonly name: string;

  protected _onLoadedConfig = new Emitter<ConfigFile<T>[]>();
  protected _onLoadedIgnore = new Emitter<IgnoreFile[]>();
  protected _onProcessedConfig = new Emitter<Required<T>>();

  /**
   * Called after config files are loaded but before processed. Can modify config file list.
   * @category Events
   */
  readonly onLoadedConfig = this._onLoadedConfig.event;

  /**
   * Called after ignore files are loaded. Can modify ignore file list.
   * @category Events
   */
  readonly onLoadedIgnore = this._onLoadedIgnore.event;

  /**
   * Called after config files are loaded and processed.
   * @category Events
   */
  readonly onProcessedConfig = this._onProcessedConfig.event;

  private readonly cache: Cache;

  private readonly configFinder: ConfigFinder<T>;

  private readonly ignoreFinder: IgnoreFinder;

  private readonly processor: Processor<T>;

  constructor(name: string, resolver?: ModuleResolver) {
    super();

    this.name = name;
    this.cache = new Cache();
    this.configFinder = new ConfigFinder({name, resolver}, this.cache);
    this.ignoreFinder = new IgnoreFinder({name}, this.cache);
    this.processor = new Processor({name});
    this.bootstrap();
  }

  /**
   * Clear all cache.
   */
  clearCache(): this {
    this.clearFileCache();
    this.clearFinderCache();

    return this;
  }

  /**
   * Clear all cached file contents.
   */
  clearFileCache(): this {
    this.cache.clearFileCache();

    return this;
  }

  /**
   * Clear all cached directory and file path information.
   */
  clearFinderCache(): this {
    this.cache.clearFinderCache();

    return this;
  }

  /**
   * Attempt to find the root directory starting from the provided directory.
   * Once the root is found, it will be cached for further lookups,
   * otherwise an error is thrown based on current configuration.
   */
  async findRootDir(fromDir: PortablePath = process.cwd()): Promise<Path> {
    return this.getConfigFinder().findRootDir(fromDir);
  }

  /**
   * Traverse upwards from the branch directory, until the root directory is found,
   * or we reach to top of the file system. While traversing, find all config files
   * within each branch directory, and the root.
   */
  async loadConfigFromBranchToRoot(dir: PortablePath): Promise<ProcessedConfig<T>> {
    const configs = await this.getConfigFinder().loadFromBranchToRoot(dir);
    this._onLoadedConfig.emit(configs);
    return this.processConfigs(configs);
  }

  /**
   * Load config files from the defined root. Root is determined by a relative
   * `.config` folder and `package.json` file.
   */
  async loadConfigFromRoot(fromDir: PortablePath = process.cwd()): Promise<ProcessedConfig<T>> {
    const configs = await this.getConfigFinder().loadFromRoot(fromDir);
    this._onLoadedConfig.emit(configs);
    return this.processConfigs(configs);
  }

  /**
   * Traverse upwards from the branch directory, until the root directory is found,
   * or we reach to top of the file system. While traversing, find all ignore files
   * within each branch directory, and the root.
   */
  async loadIgnoreFromBranchToRoot(dir: PortablePath): Promise<IgnoreFile[]> {
    const ignores = await this.getIgnoreFinder().loadFromBranchToRoot(dir);
    this._onLoadedIgnore.emit(ignores);
    return ignores;
  }

  /**
   * Load ignore file from the defined root. Root is determined by a relative
   * `.config` folder and `package.json` file.
   */
  async loadIgnoreFromRoot(dir: PortablePath = process.cwd()): Promise<IgnoreFile[]> {
    const ignores = await this.getIgnoreFinder().loadFromRoot(dir);
    this._onLoadedIgnore.emit(ignores);
    return ignores;
  }

  /**
   * Explicitly set the root directory to stop traversal at. This should only be set
   * manually when you want full control, and know file boundaries up front.
   *
   * This *does not* check for the existence of the root config file or folder.
   */
  setRootDir(dir: PortablePath): this {
    this.cache.setRootDir(dir);

    return this;
  }

  /**
   * Add a process handler to customize the processing of key-value setting pairs.
   * May only run a processor on settings found in the root of the configuration object.
   * @public
   */
  protected addProcessHandler<K extends keyof T, V = T[K]>(key: K, handler: Handler<V>): this {
    this.getProcessor().addHandler(key, handler);

    return this;
  }

  /**
   * Life cycle called on initialization.
   * @public
   */
  protected bootstrap() {}

  /**
   * Configure the finder instance.
   * @public
   */
  protected configureFinder(options: Omit<ConfigFinderOptions<T>, 'name'>): this {
    this.getConfigFinder().configure(options);

    return this;
  }

  /**
   * Configure the processor instance.
   * @public
   */
  protected configureProcessor(options: Omit<ProcessorOptions, 'name'>): this {
    this.getProcessor().configure(options);

    return this;
  }

  /**
   * Return the config file finder instance.
   */
  protected getConfigFinder(): ConfigFinder<T> {
    return this.configFinder;
  }

  /**
   * Return the ignore file finder instance.
   */
  protected getIgnoreFinder(): IgnoreFinder {
    return this.ignoreFinder;
  }

  /**
   * Return the processor instance.
   */
  protected getProcessor(): Processor<T> {
    return this.processor;
  }

  /**
   * Process all loaded config objects into a single config object, and then validate.
   */
  protected async processConfigs(files: ConfigFile<T>[]): Promise<ProcessedConfig<T>> {
    const config = await this.getProcessor().process(this.options, files, this.blueprint(schemas) as Blueprint<T>);

    this._onProcessedConfig.emit(config);

    return {
      config,
      files,
    };
  }
}
