import {createScopedError} from '@jil/common/errors/scoped';

const errors = {
  PARSE_INVALID_EXT: 'Unable to parse file "{0}". Unsupported file extension.',
  PATH_REQUIRE_ABSOLUTE: 'An absolute file path is required.',
  PATH_RESOLVE_LOOKUPS: 'Failed to resolve a path using the following lookups (in order):\n{0}\n',
  PROJECT_NO_PACKAGE: 'No `package.json` found within project root.',
};

export type CommonErrorCode = keyof typeof errors;

export const CommonError = createScopedError<CommonErrorCode>('CMN', 'CommonError', errors);

export class ExitError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);

    this.code = code;
    this.name = 'ExitError';
  }
}
