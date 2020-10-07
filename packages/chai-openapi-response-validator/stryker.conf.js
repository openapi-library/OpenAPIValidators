/** *****************************************************************************
 * Copyright 2019 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ****************************************************************************** */

// see schema at https://raw.githubusercontent.com/stryker-mutator/stryker/master/packages/api/schema/stryker-core.json

module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.ts'],
    mutator: 'typescript',
    tsconfigFile: 'tsconfig.json',
    reporters: ['clear-text', 'dots', 'html'], // see https://stryker-mutator.io/stryker/plugins#reporters
    // testRunner: 'mocha',
    testRunner: 'ts-mocha',
    mochaOptions: {
      spec: ['test/**/*.ts'],
    },
    files: [
      '**/*.js',
      '**/*.ts',
      // '../../commonTestResources/**/*',
      '!**/stryker.conf.js',
      '!../**/node_modules/**/*',
    ],
    transpilers: ['typescript'],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    thresholds: { high: 100, low: 99, break: 98 },
    packageManager: 'yarn',
    maxConcurrentTestRunners: 1,
  });
};
