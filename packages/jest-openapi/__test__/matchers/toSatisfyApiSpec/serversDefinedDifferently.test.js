const path = require('path');
const jestMatcherUtils = require('jest-matcher-utils');

const {
  joinWithNewLines,
  str,
} = require('../../../../../commonTestResources/utils');
const jestOpenAPI = require('../../..');

const expectReceivedToSatisfyApiSpec = jestMatcherUtils.matcherHint(
  'toSatisfyApiSpec',
  undefined,
  '',
  {
    comment:
      "Matches 'received' to a response defined in your API spec, then validates 'received' against it",
    isNot: false,
  },
);

const red = jestMatcherUtils.RECEIVED_COLOR;
const green = jestMatcherUtils.EXPECTED_COLOR;

const dirContainingApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/serversDefinedDifferently',
);

describe('Using OpenAPI 3 specs that define servers differently', () => {
  describe('spec has no server property', () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'noServersProperty.yml',
      );
      jestOpenAPI(pathToApiSpec);
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
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
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
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec`,
            `${red('received')} had request path ${red('/nonExistentEndpointPath')}, but your API spec has no matching path`,
            'Paths found in API spec:',
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });

  describe("spec's server property is an empty array", () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'serversIsEmptyArray.yml',
      );
      jestOpenAPI(pathToApiSpec);
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
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
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
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec`,
            `${red('received')} had request path ${red('/nonExistentEndpointPath')}, but your API spec has no matching path`,
            'Paths found in API spec:',
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });

  describe('spec defines various (relative and absolute) servers', () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'variousServers.yml',
      );
      jestOpenAPI(pathToApiSpec);
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
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          joinWithNewLines(
            `${expectReceivedToSatisfyApiSpec}`,
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /nonExistentServer' in your API spec`,
            `${red('received')} had request path ${red('/nonExistentServer')}, but your API spec has no matching servers`,
            `Servers found in API spec: ${green('/relativeServer, /differentRelativeServer, /relativeServer2, http://api.example.com/basePath1, https://api.example.com/basePath2, ws://api.example.com/basePath3, wss://api.example.com/basePath4, http://api.example.com:8443/basePath5, http://localhost:3025/basePath6, http://10.0.81.36/basePath7')}`,
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
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
            expect(res).toSatisfyApiSpec();
          });

          it('fails when using .not', () => {
            const assertion = () => expect(res).not.toSatisfyApiSpec();
            expect(assertion).toThrow(Error, '');
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
            const assertion = () => expect(res).toSatisfyApiSpec();
            expect(assertion).toThrow(
              // prettier-ignore
              joinWithNewLines(
                `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET ${serverBasePath}/nonExistentEndpointPath' in your API spec`,
                `${red('received')} had request path ${red(`${serverBasePath}/nonExistentEndpointPath`)}, but your API spec has no matching path`,
                `Paths found in API spec: ${green('/endpointPath')}`,
                `'${serverBasePath}/nonExistentEndpointPath' matches servers ${str(
                  expectedMatchingServers,
                )} but no <server/endpointPath> combinations`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(res).not.toSatisfyApiSpec();
          });
        });
      });
    });
  });

  describe('spec defines only absolute servers with base paths', () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'onlyAbsoluteServersWithBasePaths.yml',
      );
      jestOpenAPI(pathToApiSpec);
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
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
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
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          `'/basePath1/nonExistentEndpointPath' matches servers ${str([
            'http://api.example.com/basePath1',
          ])} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
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
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          `${red('/nonExistentServer')}, but your API spec has no matching servers`,
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });

  describe('spec defines only absolute servers without base paths', () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'noServersWithBasePaths.yml',
      );
      jestOpenAPI(pathToApiSpec);
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
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
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
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          `'/nonExistentEndpointPath' matches servers ${str([
            'http://api.example.com',
          ])} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });

  describe('spec defines servers using server variables', () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'withServerVariables.yml',
      );
      jestOpenAPI(pathToApiSpec);
    });

    describe('res.req.path matches a server with a server variable in the path (matches the default value)', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/defaultValueOfVariableInPath/endpointPath',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
      });
    });

    describe('res.req.path matches a server with a server variable in the path (matches a non-default value)', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/enumValueOfVariableInPath/endpointPath',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
      });
    });

    describe('res.req.path matches a server with multiple server variables in the path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path:
            '/defaultValueOfFirstVariableInPath/defaultValueOfSecondVariableInPath/endpointPath',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
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
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
      });
    });

    describe('res.req.path matches a server with server variables before and after the path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/defaultValueOfVariableInDifferentPath/endpointPath',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(Error, '');
      });
    });

    describe('res.req.path matches a server with server variables, but matches no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/defaultValueOfVariableInPath/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          Error,
          `'/defaultValueOfVariableInPath/nonExistentEndpointPath' matches servers ${str(
            [
              '/defaultValueOfVariableInPath',
              'https://{hostVariable}.com:{portVariable}/',
            ],
          )} but no <server/endpointPath> combinations`,
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });
});
