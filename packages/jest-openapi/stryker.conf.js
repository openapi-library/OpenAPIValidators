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

module.exports = (config) => {
  config.set({
    mutate: [
      'src/**/*.js',
      '!**/openapi-validator/**/*.js',
    ],
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
