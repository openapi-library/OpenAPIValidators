const chai = require('chai');
const path = require('path');

const {
  joinWithNewLines,
  str,
} = require('../../../../../commonTestResources/utils');
const chaiResponseValidator = require('../../..');

const expectedResToSatisfyApiSpec = 'expected res to satisfy API spec';

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

    describe('res.req.path matches an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/endpointPath',
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

    describe('res.req.path matches no endpoint paths', () => {
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
          joinWithNewLines(
            "expected res to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec",
            "res had request path '/nonExistentEndpointPath', but your API spec has no matching path",
            'Paths found in API spec:',
          ),
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

    describe('res.req.path matches an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/endpointPath',
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

    describe('res.req.path matches no endpoint paths', () => {
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
          joinWithNewLines(
            "expected res to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec",
            "res had request path '/nonExistentEndpointPath', but your API spec has no matching path",
            'Paths found in API spec:',
          ),
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

    describe('res.req.path matches no servers', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentServer',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          joinWithNewLines(
            expectedResToSatisfyApiSpec,
            "expected res to satisfy a '200' response defined for endpoint 'GET /nonExistentServer' in your API spec",
            "res had request path '/nonExistentServer', but your API spec has no matching servers",
            'Servers found in API spec: /relativeServer, /differentRelativeServer, /relativeServer2, http://api.example.com/basePath1, https://api.example.com/basePath2, ws://api.example.com/basePath3, wss://api.example.com/basePath4, http://api.example.com:8443/basePath5, http://localhost:3025/basePath6, http://10.0.81.36/basePath7',
          ),
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
              path: `${serverBasePath}/endpointPath`,
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
              joinWithNewLines(
                `expected res to satisfy a '200' response defined for endpoint 'GET ${serverBasePath}/nonExistentEndpointPath' in your API spec`,
                `res had request path '${serverBasePath}/nonExistentEndpointPath', but your API spec has no matching path`,
                'Paths found in API spec: /endpointPath',
                `'${serverBasePath}/nonExistentEndpointPath' matches servers ${str(
                  expectedMatchingServers,
                )} but no <server/endpointPath> combinations`,
              ),
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

    describe('res.req.matches a server and an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/basePath1/endpointPath',
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
          path: '/basePath1/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          `'/basePath1/nonExistentEndpointPath' matches servers ${str([
            'http://api.example.com/basePath1',
          ])} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });

    describe('res.req.path matches no servers', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentServer',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          "'/nonExistentServer', but your API spec has no matching servers",
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

    describe('res.req.path matches an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/endpointPath',
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

    describe('res.req.path matches no endpoint paths', () => {
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
          `'/nonExistentEndpointPath' matches servers ${str([
            'http://api.example.com',
          ])} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });

  describe('spec defines servers using server variables', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'withServerVariables.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('res.req.path matches a server with a server variable in the path (matches the default value)', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/defaultValueForVariableInPath/endpointPath',
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

    describe('res.req.path matches a server with a server variable in the path (matches a non-default value)', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/enumValueForVariableInPath/endpointPath',
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

    describe('res.req.path matches a server with multiple server variables in the path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path:
            '/defaultValueForFirstVariableInPath/defaultValueForSecondVariableInPath/endpointPath',
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

    describe('res.req.path matches a server with server variables only before the path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/endpointPath',
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

    describe('res.req.path matches a server with server variables before and after the path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/defaultValueForVariableInDifferentPath/endpointPath',
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

    describe('res.req.path matches a server with server variables, but matches no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/defaultValueForVariableInPath/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          `'/defaultValueForVariableInPath/nonExistentEndpointPath' matches servers ${str(
            [
              '/defaultValueForVariableInPath',
              'https://{hostVariable}.com:{portVariable}/',
            ],
          )} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });
});
