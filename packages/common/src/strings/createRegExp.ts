import {escapeRegExpCharacters} from './escapeRegExpCharacters';

export interface RegExpOptions {
  matchCase?: boolean;
  wholeWord?: boolean;
  multiline?: boolean;
  global?: boolean;
  unicode?: boolean;
}

/**
 * Create RegExp from string
 *
 * @param searchString
 * @param isRegex
 * @param options
 */
export function createRegExp(searchString: string, isRegex: boolean, options: RegExpOptions = {}): RegExp {
  if (!searchString) {
    throw new Error('Cannot create regex from empty string');
  }
  if (!isRegex) {
    searchString = escapeRegExpCharacters(searchString);
  }
  if (options.wholeWord) {
    if (!/\B/.test(searchString.charAt(0))) {
      searchString = '\\b' + searchString;
    }
    if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
      searchString = searchString + '\\b';
    }
  }
  let modifiers = '';
  if (options.global) {
    modifiers += 'g';
  }
  if (!options.matchCase) {
    modifiers += 'i';
  }
  if (options.multiline) {
    modifiers += 'm';
  }
  if (options.unicode) {
    modifiers += 'u';
  }

  return new RegExp(searchString, modifiers);
}
