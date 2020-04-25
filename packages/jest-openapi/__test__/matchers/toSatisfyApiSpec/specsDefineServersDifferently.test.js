const path = require('path');
const { inspect } = require('util');
const jestMatcherUtils = require('jest-matcher-utils');

const jestOpenAPI = require('../../..');

const expectReceivedToSatisfyApiSpec = jestMatcherUtils.matcherHint(
  'toSatisfyApiSpec',
  undefined,
  '',
  {
    comment: 'Matches \'received\' to a response defined in your API spec, then validates \'received\' against it',
    isNot: false,
  },
);

const red = jestMatcherUtils.RECEIVED_COLOR;
const green = jestMatcherUtils.EXPECTED_COLOR;

const dirContainingApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/valid/serversDefinedDifferently');

describe('using OpenAPI 3 specs that define servers differently', () => {
  describe('spec has no server property', () => {
    beforeAll(() => { // eslint-disable-line jest/no-hooks
      const pathToApiSpec = path.join(dirContainingApiSpec, 'noServersProperty.yml');
      jestOpenAPI(pathToApiSpec);
    });

    describe('res.req.path matches the default server (\'/\') but no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        expect.assertions(3);
        try {
          expect(res).toSatisfyApiSpec();
        } catch (error) {
          expect(error.message).toContain('Paths found'); // eslint-disable-line jest/no-try-expect
          expect(error.message).not.toContain('Server'); // eslint-disable-line jest/no-try-expect
        }
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });

  describe('spec\'s server property is an empty array', () => {
    beforeAll(() => { // eslint-disable-line jest/no-hooks
      const pathToApiSpec = path.join(dirContainingApiSpec, 'serversIsEmptyArray.yml');
      jestOpenAPI(pathToApiSpec);
    });

    describe('res.req.path matches the default server (\'/\') but no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        expect.assertions(3);
        try {
          expect(res).toSatisfyApiSpec();
        } catch (error) {
          expect(error.message).toContain('Paths found'); // eslint-disable-line jest/no-try-expect
          expect(error.message).not.toContain('Server'); // eslint-disable-line jest/no-try-expect
        }
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });


  describe('spec defines servers', () => {
    beforeAll(() => { // eslint-disable-line jest/no-hooks
      const pathToApiSpec = path.join(dirContainingApiSpec, 'onlyAbsoluteServersWithBasePaths.yml');
      jestOpenAPI(pathToApiSpec);
    });

    describe('res.req.path does not match any servers', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: 'nonExistentServer',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(new Error(
          `${expectReceivedToSatisfyApiSpec}`
          + `\n\nexpected ${red('received')} to satisfy a '200' response defined for endpoint 'GET nonExistentServer' in your API spec`
          + `\n${red('received')} had request path ${red('nonExistentServer')}, but your API spec has no matching path`
          + `\n\nPaths found in API spec: ${green('/test/responseBody/string')}`
          + '\n\n\'nonExistentServer\' matches no servers'
          + '\n\nServers found in API spec: http://api.example.com/basePath1',
        ));
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
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
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(new Error(
          `${expectReceivedToSatisfyApiSpec}`
          + `\n\nexpected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /basePath1/nonExistentEndpointPath' in your API spec`
          + `\n${red('received')} had request path ${red('/basePath1/nonExistentEndpointPath')}, but your API spec has no matching path`
          + `\n\nPaths found in API spec: ${green('/test/responseBody/string')}`
          + `\n\n'/basePath1/nonExistentEndpointPath' matches servers ${inspect(['http://api.example.com/basePath1'])}`
          + ' but no <server/endpointPath> combinations'
          + '\n\nServers found in API spec: http://api.example.com/basePath1',
        ));
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });
});
