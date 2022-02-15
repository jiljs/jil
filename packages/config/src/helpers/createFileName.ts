import {CONFIG_FOLDER} from '../constants';
import {FileType} from '../types';

export function createFileName(type: FileType, name: string, ext: string, suffix?: string): string {
  // jil.js
  let fileName = name;

  // .jil.js
  if (type === 'branch') {
    fileName = `.${name}`;
  }

  // .config/jil.js
  if (type === 'root-folder') {
    fileName = `${CONFIG_FOLDER}/${name}`;
  }

  // jil.config.js
  if (type === 'root-file') {
    fileName = name + CONFIG_FOLDER;
  }

  if (suffix) {
    fileName += `.${suffix}`;
  }

  fileName += `.${ext}`;

  return fileName;
}
