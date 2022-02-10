import {isObject} from 'tily/is/object';
import {toArray} from 'tily/array/toArray';
import {PluginOptions, PluginsSetting, PluginsSettingList, PluginsSettingMap} from '../types';
import {mergeObject} from './merge-object';

function convertListToMap(list: PluginsSettingList): PluginsSettingMap {
  const map: PluginsSettingMap = {};
  for (const entry of list) {
    const [name, options = true] = toArray(entry) as [string, PluginOptions?];
    map[name] = options;
  }
  return map;
}

/**
 * Merges previous and next plugin configurations into an object.
 * Plugin configs can either be a list of sources, or list of sources
 * with flags/options (tuples), or a map of sources to flags/options.
 * This is useful if utilizing the `@jil/plugin` package.
 */
export function mergePlugins(prev: PluginsSetting, next: PluginsSetting): PluginsSettingMap {
  const plugins = Array.isArray(prev) ? convertListToMap(prev) : {...prev};

  Object.entries(Array.isArray(next) ? convertListToMap(next) : next).forEach(([name, options]) => {
    if (isObject(options)) {
      plugins[name] = isObject(plugins[name]) ? mergeObject(plugins[name] as object, options) : options;
    } else if (options !== undefined) {
      plugins[name] = options;
    }
  });

  return plugins;
}
