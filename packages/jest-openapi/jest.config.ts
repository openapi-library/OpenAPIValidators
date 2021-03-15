import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>/jest-openapi', '<rootDir>/openapi-validator'],
  collectCoverageFrom: [
    '<rootDir>/jest-openapi/src/**/*',
    '<rootDir>/openapi-validator/lib/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
