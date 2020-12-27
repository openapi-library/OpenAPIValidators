module.exports = (config) => {
  config.set({
    mutate: ['src/**/*.js', '!**/openapi-validator/**/*.js'],
    mutator: 'javascript',
    reporters: ['clear-text', 'dots', 'html'], // see https://stryker-mutator.io/stryker/plugins#reporters
    testRunner: 'jest',
    files: [
      '**/*.js',
      '../../commonTestResources/**/*',
      '!**/node_modules/**/*',
    ],
    transpilers: [],
    findRelatedTests: true,
    thresholds: { high: 100, low: 99, break: 91 },
    maxConcurrentTestRunners: 2, // reduces timeouts, not sure why
    packageManager: 'yarn',
  });
};
