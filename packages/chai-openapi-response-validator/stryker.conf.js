module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    mutator: 'javascript',
    reporters: ['clear-text', 'dots', 'html'], // see https://stryker-mutator.io/stryker/plugins#reporters
    testRunner: 'mocha',
    mochaOptions: {
      spec: ['test/**/*.test.js'],
    },
    files: [
      '**/*.js',
      '../../commonTestResources/**/*',
      '!../**/node_modules/**/*',
    ],
    transpilers: [],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    thresholds: { high: 100, low: 99, break: 98 },
    packageManager: 'yarn',
    maxConcurrentTestRunners: 1,
  });
};
