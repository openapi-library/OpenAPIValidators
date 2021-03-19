import path from 'path';
import {
  RECEIVED_COLOR as red,
  EXPECTED_COLOR as green,
} from 'jest-matcher-utils';

import { joinWithNewLines } from '../../../../../commonTestResources/utils';
import jestOpenAPI from '../../..';

const startOfAssertionErrorMessage = 'expect';

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
          path: '/endpointPath',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(startOfAssertionErrorMessage);
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
          `${joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec`,
            `${red('received')} had request path ${red('/nonExistentEndpointPath')}, but your API spec has no matching path`,
            `Paths found in API spec: ${green('/endpointPath')}`,
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
          path: '/basePath/endpointPath',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(startOfAssertionErrorMessage);
      });
    });

    describe('res.req.path does not match the basePath', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/wrongBasePath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /wrongBasePath' in your API spec`,
            `${red('received')} had request path ${red('/wrongBasePath')}, but your API spec has basePath ${green('/basePath')}`,
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
          path: '/basePath/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).toSatisfyApiSpec();
        expect(assertion).toThrow(
          // prettier-ignore
          joinWithNewLines(
            `expected ${red('received')} to satisfy a '200' response defined for endpoint 'GET /basePath/nonExistentEndpointPath' in your API spec`,
            `${red('received')} had request path ${red('/basePath/nonExistentEndpointPath')}, but your API spec has no matching path`,
            `Paths found in API spec: ${green('/endpointPath')}`,
            "'/basePath/nonExistentEndpointPath' matches basePath `/basePath` but no <basePath/endpointPath> combinations",
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).not.toSatisfyApiSpec();
      });
    });
  });
});
