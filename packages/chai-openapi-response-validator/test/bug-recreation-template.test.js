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

const chai = require('chai');
const path = require('path');

const chaiResponseValidator = require('..');

const dirContainingApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/valid/bugRecreationTemplate');
const { expect } = chai;

describe('Recreate bug (issue #46)', function () {
  before(function () {
    const pathToApiSpec = path.join(dirContainingApiSpec, 'openapi.yml');
    chai.use(chaiResponseValidator(pathToApiSpec));
  });

  const res = {
    status: 200,
    req: {
      method: 'GET',
      path: '/test',
    },
    body: {
      expectedProperty1: 'foo',
      expectedProperty2: 'bar',
    },
  };

  it('passes', function () {
    expect(res).to.satisfyApiSpec;
  });

  it('fails when using .not', function () {
    const assertion = () => expect(res).to.not.satisfyApiSpec;
    expect(assertion).to.throw();
  });
});
