const path = require('path');

const jestOpenAPI = require('../../..');

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/preferNonTemplatedPathOverTemplatedPath',
);

describe('expect(res).toSatisfyApiSpec() (using an OpenAPI spec with similar templated and non-templated OpenAPI paths)', () => {
  [2, 3].forEach((openApiVersion) => {
    describe(`OpenAPI ${openApiVersion}`, () => {
      const openApiSpecs = [
        {
          isNonTemplatedPathFirst: true,
          pathToApiSpec: path.join(
            openApiSpecsDir,
            'nonTemplatedPathBeforeTemplatedPath',
            `openapi${openApiVersion}.yml`,
          ),
        },
        {
          isNonTemplatedPathFirst: false,
          pathToApiSpec: path.join(
            openApiSpecsDir,
            'nonTemplatedPathAfterTemplatedPath',
            `openapi${openApiVersion}.yml`,
          ),
        },
      ];

      openApiSpecs.forEach((spec) => {
        const { pathToApiSpec, isNonTemplatedPathFirst } = spec;

        describe(`res.req.path matches a non-templated OpenAPI path ${
          isNonTemplatedPathFirst ? 'before' : 'after'
        } a templated OpenAPI path`, () => {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: '/preferNonTemplatedPathOverTemplatedPath/nonTemplatedPath',
            },
            body: 'valid body (string)',
          };

          beforeAll(() => {
            jestOpenAPI(pathToApiSpec);
          });

          it('passes', () => {
            expect(res).toSatisfyApiSpec();
          });

          it('fails when using .not', () => {
            const assertion = () => expect(res).not.toSatisfyApiSpec();
            expect(assertion).toThrow(
              "not to satisfy the '200' response defined for endpoint 'GET /preferNonTemplatedPathOverTemplatedPath/nonTemplatedPath'",
            );
          });
        });
      });
    });
  });
});
