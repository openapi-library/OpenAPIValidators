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
const util = require('util');

const chaiResponseValidator = require('../../..');

const dirContainingApiSpec = path.resolve('test/resources/exampleOpenApiFiles/valid/serversDefinedDifferently');
const { expect } = chai;

describe('Using OpenAPI 3 specs that define servers differently', function () {

  describe('spec has no server property', function() {

    before(function () {
      const pathToApiSpec = path.join(dirContainingApiSpec, 'noServersProperty.yml');
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('res.req.path matches the default server (\'/\') and an endpoint path', function () {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/responseBody/string',
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
    describe('res.req.path does not match any servers', function () {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', function () {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw('No server matching \'nonExistentServer/test/responseBody/string\' path defined in OpenAPI spec');
      });

      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw('No server matching \'nonExistentServer/test/responseBody/string\' path defined in OpenAPI spec');
      });
    });
    describe('res.req.path matches the default server (\'/\') but no endpoint paths', function () {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', function () {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(`No '/nonExistentEndpointPath' path defined in OpenAPI spec. (Matches servers ${util.inspect(['/'])} but no 'serverUrl/endpointPath' combinations)`);
      });

      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(`No '/nonExistentEndpointPath' path defined in OpenAPI spec. (Matches servers ${util.inspect(['/'])} but no 'serverUrl/endpointPath' combinations)`);
      });
    });
  });

  describe('spec\'s server property is an empty array', function() {

    before(function () {
      const pathToApiSpec = path.join(dirContainingApiSpec, 'serversIsEmptyArray.yml');
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('res.req.path matches the default server (\'/\') and an endpoint path', function () {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/responseBody/string',
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
    describe('res.req.path does not match any servers', function () {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', function () {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw('No server matching \'nonExistentServer/test/responseBody/string\' path defined in OpenAPI spec');
      });

      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw('No server matching \'nonExistentServer/test/responseBody/string\' path defined in OpenAPI spec');
      });
    });
    describe('res.req.path matches the default server (\'/\') but no endpoint paths', function () {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', function () {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(`No '/nonExistentEndpointPath' path defined in OpenAPI spec. (Matches servers ${util.inspect(['/'])} but no 'serverUrl/endpointPath' combinations)`);
      });

      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(`No '/nonExistentEndpointPath' path defined in OpenAPI spec. (Matches servers ${util.inspect(['/'])} but no 'serverUrl/endpointPath' combinations)`);
      });
    });
  });

  describe('spec\'s server property is an array of servers', function() {
    const tests = {
      'default server url (\'/\')': {
        serverUrl: '',
        expectedMatchingServers: [
          '/',
        ],
      },
      'relative server url': {
        serverUrl: '/relativeServer',
        expectedMatchingServers: [
          '/',
          '/relativeServer',
        ],
      },
      'different relative server url': {
        serverUrl: '/differentRelativeServer',
        expectedMatchingServers: [
          '/',
          '/differentRelativeServer',
        ],
      },
      'multiple relative server urls': {
        serverUrl: '/relativeServer2',
        expectedMatchingServers: [
          '/',
          '/relativeServer',
          '/relativeServer2',
        ],
      },
    };

    for (const [testName, test] of Object.entries(tests)) {
      describe(`res.req.path contains a ${testName}`, function() {

        const {
          serverUrl,
          expectedMatchingServers,
        } = test;

        before(function () {
          const pathToApiSpec = path.join(dirContainingApiSpec, 'variousServers.yml');
          chai.use(chaiResponseValidator(pathToApiSpec));
        });

        describe(`res.req.path matches a server ('${serverUrl}') and an endpoint path`, function () {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: `${serverUrl}/test/responseBody/string`,
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
        describe('res.req.path does not match any servers', function () {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: 'nonExistentServer/test/responseBody/string',
            },
            body: 'valid body (string)',
          };

          it('fails', function () {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw('No server matching \'nonExistentServer/test/responseBody/string\' path defined in OpenAPI spec');
          });

          it('fails when using .not', function () {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw('No server matching \'nonExistentServer/test/responseBody/string\' path defined in OpenAPI spec');
          });
        });
        describe(`res.req.path matches a server ('${serverUrl}') but no endpoint paths`, function () {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: `${serverUrl}/nonExistentEndpointPath`,
            },
            body: 'valid body (string)',
          };

          it('fails', function () {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw(`No '${serverUrl}/nonExistentEndpointPath' path defined in OpenAPI spec. (Matches servers ${util.inspect(expectedMatchingServers)} but no 'serverUrl/endpointPath' combinations)`);
          });

          it('fails when using .not', function () {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw(`No '${serverUrl}/nonExistentEndpointPath' path defined in OpenAPI spec. (Matches servers ${util.inspect(expectedMatchingServers)} but no 'serverUrl/endpointPath' combinations)`);
          });
        });
      });
    }
  });
});
