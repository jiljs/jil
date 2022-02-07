/**
 * Strip wildcard from string
 *
 * @param pattern
 *
 * @example
 *
 *      stripWildcards('abc/*');  //=> 'abc/'
 */
export function stripWildcards(pattern: string): string {
  return pattern.replace(/\*/g, '');
}
