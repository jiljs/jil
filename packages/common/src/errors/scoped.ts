const InternalErrors = {
  INVALID_SCOPE_NAME: 'Error scope must be 3 characters and all uppercase.',
  UNKNOWN_ERROR: 'An unknown error has occurred.',
};

const TOKEN_PATTERN = /\{(\d+)\}/gu;

export type Errors = Record<string, string>;

export interface ScopedError<Code extends string = string> {
  code: Code | 'UNKNOWN_ERROR';
  scope: string;
}

/**
 *
 * An Error class builder.
 *
 * @example
 *
 * const errors = {
 *   PARSE_INVALID_EXT: 'Unable to parse file "{0}". Unsupported file extension.',
 *   PATH_REQUIRE_ABSOLUTE: 'An absolute file path is required.',
 *   PATH_RESOLVE_LOOKUPS: 'Failed to resolve a path using the following lookups (in order):\n{0}\n',
 *   PROJECT_NO_PACKAGE: 'No `package.json` found within project root.',
 * };
 *
 * type CommonErrorCode = keyof typeof errors;
 *
 * const CommonError = createScopedError<CommonErrorCode>('CMN', 'CommonError', errors);
 *
 * @param scope
 * @param name
 * @param errors
 */
export function createScopedError<Code extends string = string>(
  scope: string,
  name: string,
  errors: Errors,
): new (code: Code, params?: unknown[]) => Error & ScopedError<Code> {
  function msg(code: string, messages: Errors, params: unknown[] = []): string {
    if (!messages[code]) {
      return '';
    }

    return `${messages[code].replace(TOKEN_PATTERN, (match, index) =>
      String(params[index as number]),
    )} [${scope}:${code}]`;
  }

  if (process.env.NODE_ENV !== 'production' && (scope.length !== 3 || scope !== scope.toUpperCase())) {
    throw new Error(msg('INVALID_SCOPE_NAME', InternalErrors));
  }

  return class InternalError extends Error implements ScopedError<Code> {
    code: Code | 'UNKNOWN_ERROR';

    scope: string = scope;

    constructor(code: Code, params?: unknown[]) {
      super(msg(code, errors, params));

      this.code = code;
      this.name = name;

      // If a message was not loaded, we are throwing an unknown error
      if (!this.message) {
        this.code = 'UNKNOWN_ERROR';
        this.message = msg('UNKNOWN_ERROR', InternalErrors);
      }
    }
  };
}
