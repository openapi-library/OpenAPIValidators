import chai from 'chai';
import path from 'path';

import { joinWithNewLines } from '../../../../../commonTestResources/utils';
import chaiResponseValidator from '../../..';

const dirContainingApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/basePathDefinedDifferently',
);
const { expect, AssertionError } = chai;

describe('Using OpenAPI 2 specs that define basePath differently', () => {
  describe('spec has no basePath property', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'noBasePathProperty.yml',
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
          new RegExp(
            `${joinWithNewLines(
              "expected res to satisfy a '200' response defined for endpoint 'GET /nonExistentEndpointPath' in your API spec",
              "res had request path '/nonExistentEndpointPath', but your API spec has no matching path",
              'Paths found in API spec: /endpointPath',
            )}$`,
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });

  describe('spec has basePath property', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'basePathProperty.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
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
        expect(res).to.satisfyApiSpec;
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(AssertionError, '');
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
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          joinWithNewLines(
            "expected res to satisfy a '200' response defined for endpoint 'GET /wrongBasePath' in your API spec",
            "res had request path '/wrongBasePath', but your API spec has basePath '/basePath'",
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
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
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          joinWithNewLines(
            "expected res to satisfy a '200' response defined for endpoint 'GET /basePath/nonExistentEndpointPath' in your API spec",
            "res had request path '/basePath/nonExistentEndpointPath', but your API spec has no matching path",
            'Paths found in API spec: /endpointPath',
            "'/basePath/nonExistentEndpointPath' matches basePath `/basePath` but no <basePath/endpointPath> combinations",
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });
});
