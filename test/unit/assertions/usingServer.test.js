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

const chai = require('chai');
const path = require('path');

const chaiResponseValidator = require('../../..');

const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/valid/openapi3.yml');
chai.use(chaiResponseValidator(pathToApiSpec));
const { expect } = chai;

describe('Using an OA3 spec that defines server paths', function () {
  describe('res.req.path matches a defined sever path', function () {
    const differentServer = '/remote';
    const res = {
      status: 200,
      req: {
        method: 'GET',
        path: `${differentServer}/test/responseBody/schemaDef`,
      },
      body: 'valid body (string)',
    };

    it('passes', function () {
      expect(res).to.satisfyApiSpec;
    });

    it('fails when using .not', function () {
      const assertion = () => expect(res).to.not.satisfyApiSpec;
      expect(assertion).to.throw('');
    });
  });
  describe('res.req.path does not match a defined sever path', function () {
    const differentServer = '/missing';
    const res = {
      status: 200,
      req: {
        method: 'GET',
        path: `${differentServer}/test/responseBody/schemaDef`,
      },
      body: 'valid body (string)',
    };

    it('fails', function () {
      const assertion = () => expect(res).to.satisfyApiSpec;
      expect(assertion).to.throw('No server matching \'/missing/test/responseBody/schemaDef\' path defined in OpenAPI spec');
    });

    it('fails when using .not', function () {
      const assertion = () => expect(res).to.not.satisfyApiSpec;
      expect(assertion).to.throw('No server matching \'/missing/test/responseBody/schemaDef\' path defined in OpenAPI spec');
    });
  });
});
