import { Contract } from "@jil/common/contract";
import { ModuleResolver, PortablePath } from "@jil/common-node";
import { Blueprint, schemas } from "@jil/common/optimal";
import { Emitter } from "@jil/event/emitter";
import { Cache } from "./cache";
import { ConfigFinder } from "./config-finder";
import { IgnoreFinder } from "./ignore-finder";
import { Processor } from "./processor";
import { ConfigFile, ConfigFinderOptions, Handler, IgnoreFile, ProcessedConfig, ProcessorOptions } from "./types";

export abstract class Configuration<T extends object> extends Contract<T> {
  protected _onProcessedConfig = new Emitter<Required<T>>();
  /**
   * Called after config files are loaded and processed.
   * @category Events
   */
  readonly onProcessedConfig = this._onProcessedConfig.event;

  protected readonly _onLoadedConfig = new Emitter<ConfigFile<T>[]>();
  /**
   * Called after config files are loaded but before processed. Can modify config file list.
   * @category Events
   */
  readonly onLoadedConfig = this._onLoadedConfig.event;

  protected readonly _onLoadedIgnore = new Emitter<IgnoreFile[]>();
  /**
   * Called after ignore files are loaded. Can modify ignore file list.
   * @category Events
   */
  readonly onLoadedIgnore = this._onLoadedIgnore.event;
  private readonly cache: Cache;

  private readonly configFinder: ConfigFinder<T>;

  private readonly ignoreFinder: IgnoreFinder;

  private readonly processor: Processor<T>;

  constructor(name: string, resolver?: ModuleResolver) {
    super();

    this.cache = new Cache();
    this.configFinder = new ConfigFinder({ name, resolver }, this.cache);
    this.ignoreFinder = new IgnoreFinder({ name }, this.cache);
    this.processor = new Processor({ name });
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
  async loadConfigFromRoot(dir: PortablePath = process.cwd()): Promise<ProcessedConfig<T>> {
    const configs = await this.getConfigFinder().loadFromRoot(dir);
    this._onLoadedConfig.emit(configs)
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
  protected bootstrap() {
  }

  /**
   * Configure the finder instance.
   * @public
   */
  protected configureFinder(options: Omit<ConfigFinderOptions<T>, "name">): this {
    this.getConfigFinder().configure(options);

    return this;
  }

  /**
   * Configure the processor instance.
   * @public
   */
  protected configureProcessor(options: Omit<ProcessorOptions, "name">): this {
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
    const config = await this.getProcessor().process(
      this.options,
      files,
      this.blueprint(schemas) as Blueprint<T>
    );

    this._onProcessedConfig.emit(config);

    return {
      config,
      files
    };
  }
}
