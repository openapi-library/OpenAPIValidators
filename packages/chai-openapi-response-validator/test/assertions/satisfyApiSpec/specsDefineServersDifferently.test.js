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
const { inspect } = require('util');

const chaiResponseValidator = require('../../..');

const dirContainingApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/serversDefinedDifferently',
);
const { expect, AssertionError } = chai;

describe('Using OpenAPI 3 specs that define servers differently', () => {
  describe('spec has no server property', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'noServersProperty.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe("res.req.path matches the default server ('/') and an endpoint path", () => {
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
    describe('res.req.path does not match any servers', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          "expected res to satisfy a '200' response defined for endpoint 'GET nonExistentServer/test/responseBody/string' in your API spec" +
            "\nres had request path 'nonExistentServer/test/responseBody/string', but your API spec has no matching path" +
            '\n\nPaths found in API spec:',
          // we don't list servers defined in your API spec because there aren't any
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
    describe("res.req.path matches the default server ('/') but no endpoint paths", () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          "expected res to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec" +
            "\nres had request path '/nonExistentEndpointPath', but your API spec has no matching path" +
            '\n\nPaths found in API spec:',
          // we don't list servers defined in your API spec because there aren't any
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });

  describe("spec's server property is an empty array", () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'serversIsEmptyArray.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe("res.req.path matches the default server ('/') and an endpoint path", () => {
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
    describe('res.req.path does not match any servers', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          "expected res to satisfy a '200' response defined for endpoint 'GET nonExistentServer/test/responseBody/string' in your API spec" +
            "\nres had request path 'nonExistentServer/test/responseBody/string', but your API spec has no matching path" +
            '\n\nPaths found in API spec:',
          // we don't list servers defined in your API spec because there aren't any
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
    describe("res.req.path matches the default server ('/') but no endpoint paths", () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          "expected res to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec" +
            "\nres had request path '/nonExistentEndpointPath', but your API spec has no matching path" +
            '\n\nPaths found in API spec:',
          // we don't list servers defined in your API spec because there aren't any
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });

  describe('spec defines various (relative and absolute) servers', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'variousServers.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('res.req.path does not match any servers', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          'expected res to satisfy API spec' +
            "\n\nexpected res to satisfy a '200' response defined for endpoint 'GET nonExistentServer/test/responseBody/string' in your API spec" +
            "\nres had request path 'nonExistentServer/test/responseBody/string', but your API spec has no matching path" +
            '\n\nPaths found in API spec: /test/responseBody/string' +
            "\n\n'nonExistentServer/test/responseBody/string' matches no servers" +
            '\n\nServers found in API spec: /relativeServer, /differentRelativeServer', // etc.
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });

    const tests = {
      'a relative server url': {
        serverBasePath: '/relativeServer',
        expectedMatchingServers: ['/relativeServer'],
      },
      'a different relative server url': {
        serverBasePath: '/differentRelativeServer',
        expectedMatchingServers: ['/differentRelativeServer'],
      },
      'multiple server urls': {
        serverBasePath: '/relativeServer2',
        expectedMatchingServers: ['/relativeServer', '/relativeServer2'],
      },
      'base path of absolute server url with http scheme': {
        serverBasePath: '/basePath1',
        expectedMatchingServers: ['http://api.example.com/basePath1'],
      },
      'base path of absolute server url with https scheme': {
        serverBasePath: '/basePath2',
        expectedMatchingServers: ['https://api.example.com/basePath2'],
      },
      'base path of absolute server url with ws scheme': {
        serverBasePath: '/basePath3',
        expectedMatchingServers: ['ws://api.example.com/basePath3'],
      },
      'base path of absolute server url with wss scheme': {
        serverBasePath: '/basePath4',
        expectedMatchingServers: ['wss://api.example.com/basePath4'],
      },
      'base path of absolute server url with port': {
        serverBasePath: '/basePath5',
        expectedMatchingServers: ['http://api.example.com:8443/basePath5'],
      },
      'base path of absolute server url with localhost': {
        serverBasePath: '/basePath6',
        expectedMatchingServers: ['http://localhost:3025/basePath6'],
      },
      'base path of absolute server url with IPv4 host': {
        serverBasePath: '/basePath7',
        expectedMatchingServers: ['http://10.0.81.36/basePath7'],
      },
    };

    Object.entries(tests).forEach(([testName, test]) => {
      describe(`res.req.path matches ${testName}`, () => {
        const { serverBasePath, expectedMatchingServers } = test;

        describe('res.req.path matches a server and an endpoint path', () => {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: `${serverBasePath}/test/responseBody/string`,
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
        describe('res.req.path matches a server but no endpoint paths', () => {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: `${serverBasePath}/nonExistentEndpointPath`,
            },
            body: 'valid body (string)',
          };

          it('fails', () => {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw(
              `expected res to satisfy a '200' response defined for endpoint 'GET ${serverBasePath}/nonExistentEndpointPath' in your API spec` +
                `\nres had request path '${serverBasePath}/nonExistentEndpointPath', but your API spec has no matching path` +
                '\n\nPaths found in API spec: /test/responseBody/string' +
                `\n\n'${serverBasePath}/nonExistentEndpointPath' matches servers ${inspect(
                  expectedMatchingServers,
                )} but no <server/endpointPath> combinations` +
                '\n\nServers found in API spec: /relativeServer, /differentRelativeServer', // etc.
            );
          });

          it('passes when using .not', () => {
            expect(res).to.not.satisfyApiSpec;
          });
        });
      });
    });
  });

  describe('spec defines only absolute servers with base paths', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'onlyAbsoluteServersWithBasePaths.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('res.req.matches a server base path and an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/basePath1/test/responseBody/string',
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

    describe('res.req.path matches a server base path but no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/basePath1/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          `'/basePath1/nonExistentEndpointPath' matches servers ${inspect([
            'http://api.example.com/basePath1',
          ])} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });

    describe("res.req.path does not match any defined server base paths, nor the default base path ('/')", () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          "'nonExistentServer/test/responseBody/string' matches no servers",
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });

    describe("res.req.path does not match any defined server base paths, but does match the default base path ('/')", () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          "'/test/responseBody/string' matches no servers",
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });

  describe('spec defines only absolute servers without base paths', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'noServersWithBasePaths.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe("res.req.path matches the default server base path ('/') and an endpoint path", () => {
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

    describe("res.req.path matches the default server base path ('/') but no endpoint paths", () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          `'/nonExistentEndpointPath' matches servers ${inspect([
            'http://api.example.com',
          ])} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });

    describe("res.req.path does not match the default server base path ('/') nor any servers", () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          "'nonExistentServer/test/responseBody/string' matches no servers",
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });
});
