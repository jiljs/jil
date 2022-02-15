import {OptionConfig, OptionConfigMap} from '@jil/args';
import {Blueprint, optimal} from '@jil/common/optimal';
import {msg} from '../translate';
import {
  flagBlueprint,
  numberOptionBlueprint,
  numbersOptionBlueprint,
  stringOptionBlueprint,
  stringsOptionBlueprint,
} from './blueprints';

export function validateOptions(options: OptionConfigMap) {
  Object.entries(options).forEach(([name, config]) => {
    let blueprint: Blueprint<object>;

    if (config.type === 'boolean') {
      blueprint = flagBlueprint;
    } else if (config.type === 'number') {
      blueprint = config.multiple ? numbersOptionBlueprint : numberOptionBlueprint;
    } else {
      blueprint = config.multiple ? stringsOptionBlueprint : stringOptionBlueprint;
    }

    optimal(blueprint as Blueprint<OptionConfig>, {
      name: msg('cli:labelOption', {name}),
      unknown: false,
    }).validate(config);
  });
}
