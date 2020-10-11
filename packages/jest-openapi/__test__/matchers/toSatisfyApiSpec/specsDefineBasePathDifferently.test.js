const path = require('path');
const jestMatcherUtils = require('jest-matcher-utils');

const {
  joinWithNewLines,
} = require('../../../../../commonTestResources/utils');
const jestOpenAPI = require('../../..');

const red = jestMatcherUtils.RECEIVED_COLOR;
const green = jestMatcherUtils.EXPECTED_COLOR;

const dirContainingApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/basePathDefinedDifferently',
);
describe('Using OpenAPI 2 specs that define basePath differently', () => {
  describe('spec has no basePath property', () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'noBasePathProperty.yml',
      );
      jestOpenAPI(pathToApiSpec);
    });

    describe('res.req.path matches an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/responseBody/string',
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
          path: '/test/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          `${joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /test/nonExistentEndpointPath' in your API spec`,
            `${red('received')} had request path ${red('/test/nonExistentEndpointPath')}, but your API spec has no matching path`,
            `Paths found in API spec: ${green('/test/responseBody/string')}`,
          )}`,
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });

  describe('spec has basePath property', () => {
    beforeAll(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'basePathProperty.yml',
      );
      jestOpenAPI(pathToApiSpec);
    });

    describe('res.req.path matches the basePath and an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/responseBody/string',
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

    describe('res.req.path does not match the basePath', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /responseBody/string' in your API spec`,
            `${red('received')} had request path ${red('/responseBody/string')}, but your API spec has basePath ${green('/test')}`,
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });

    describe('res.req.path matches the basePath but no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /test/nonExistentEndpointPath' in your API spec`,
            `${red('received')} had request path ${red('/test/nonExistentEndpointPath')}, but your API spec has no matching path`,
            `Paths found in API spec: ${green('/responseBody/string')}`,
            "'/test/nonExistentEndpointPath' matches basePath `/test` but no <basePath/endpointPath> combinations",
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });
});
