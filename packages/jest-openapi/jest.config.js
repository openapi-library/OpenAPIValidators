module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>/jest-openapi'],
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
