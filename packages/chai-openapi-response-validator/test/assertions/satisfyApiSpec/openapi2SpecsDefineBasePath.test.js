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

const chaiResponseValidator = require('../../..');

const { expect, AssertionError } = chai;

describe('Using OpenAPI 2 specs that define a basePath', () => {
  before(() => {
    chai.use(chaiResponseValidator(path.resolve(
      '../../commonTestResources/exampleOpenApiFiles/valid/'
         + 'openapi2DefineBasePath.yml'
    )));
  });

  describe("res.req.path matches the basePath ('/test') and an endpoint path", () => {
    const res = {
      status: 200,
      req: {
        method: 'GET',
        path: '/test/responseBody/string',
      },
      body: 'valid body (string)',
    };

    it('passes', () => {
      expect(res).to.satisfyApiSpec;
    });

    it('fails when using .not', () => {
      const assertion = () => expect(res).to.not.satisfyApiSpec;
      expect(assertion).to.throw(AssertionError, '');
    });
  });
  describe('res.req.path does not include the basePath', () => {
    const res = {
      status: 200,
      req: {
        method: 'GET',
        path: '/responseBody/string',
      },
      body: 'valid body (string)',
    };

    it('fails', () => {
      const assertion = () => expect(res).to.satisfyApiSpec;
      expect(assertion).to.throw(
        "expected res to satisfy a '200' response defined for endpoint 'GET /responseBody/string' in your API spec" +
        "\nres had request path '/responseBody/string', but your API spec has no matching path" +
                '\n\nPaths found in API spec: /test/responseBody/string'
      );
    });

    it('passes when using .not', () => {
      expect(res).to.not.satisfyApiSpec;
    });
  });
  describe("res.req.path matches the basePath ('/test') but no endpoint paths", () => {
    const res = {
      status: 200,
      req: {
        method: 'GET',
        path: '/test/nonExistentEndpointPath',
      },
      body: 'valid body (string)',
    };

    it('fails', () => {
      const assertion = () => expect(res).to.satisfyApiSpec;
      expect(assertion).to.throw(
              `expected res to satisfy a '200' response defined for endpoint 'GET /test/nonExistentEndpointPath' in your API spec` +
                `\nres had request path '/test/nonExistentEndpointPath', but your API spec has no matching path` +
                '\n\nPaths found in API spec: /test/responseBody/string'
      );
    });

    it('passes when using .not', () => {
      expect(res).to.not.satisfyApiSpec;
    });
  });
});
