/*******************************************************************************
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
 *******************************************************************************/

module.exports = function(config) {
  config.set({
    mutate: [
      'lib/**/*.js',
    ],
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['clear-text', 'dots'], // see https://stryker-mutator.io/stryker/plugins#reporters
    testRunner: 'mocha',
    mochaOptions: {
      spec: ['./test/**/*.test.js'],
    },
    transpilers: [],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    thresholds: { high: 100, low: 96, break: 90 },
    maxConcurrentTestRunners: 2, // resolves issue with tests not completing. See: https://github.com/stryker-mutator/stryker/issues/1542#issuecomment-495477158
  });
};
