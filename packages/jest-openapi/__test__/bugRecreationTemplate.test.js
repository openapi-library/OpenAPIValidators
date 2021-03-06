const path = require('path');
const { inspect } = require('util');

const jestOpenAPI = require('..');

const dirContainingApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/bugRecreationTemplate',
);

describe('Recreate bug (issue #XX)', () => {
  beforeAll(() => {
    const pathToApiSpec = path.join(dirContainingApiSpec, 'openapi.yml');
    jestOpenAPI(pathToApiSpec);
  });

  const res = {
    status: 200,
    req: {
      method: 'GET',
      path: '/recreate/bug',
    },
    body: {
      expectedProperty1: 'foo',
    },
  };

  it('passes', () => {
    expect(res).toSatisfyApiSpec();
  });

  it('fails when using .not', () => {
    const assertion = () => expect(res).not.toSatisfyApiSpec();
    expect(assertion).toThrow(
      inspect({
        body: {
          expectedProperty1: 'foo',
        },
      }),
    );
  });
});
