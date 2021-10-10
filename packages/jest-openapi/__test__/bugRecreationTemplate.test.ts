import path from 'path';
import { inspect } from 'util';

import jestOpenAPI from '..';

const dirContainingApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/bugRecreationTemplate',
);

describe('Recreate bug (issue #250)', () => {
  beforeAll(() => {
    const pathToApiSpec = path.join(dirContainingApiSpec, 'openapi.yml');
    jestOpenAPI(pathToApiSpec);
  });

  const res = {
    status: 200,
    req: {
      method: 'GET',
      path: '/recreate/bug/a,b',
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
