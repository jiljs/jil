module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
  testEnvironment: 'jest-environment-node-single-context',
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
};
