import { RECEIVED_COLOR as red } from 'jest-matcher-utils';
import path from 'path';

import { joinWithNewLines } from '../../../../../commonTestResources/utils';
import jestOpenAPI from '../../..';

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/noResponseComponents',
);
const openApiSpecs = [
  {
    openApiVersion: 2,
    pathToApiSpec: path.join(openApiSpecsDir, 'openapi2WithNoResponses.json'),
  },
  {
    openApiVersion: 3,
    pathToApiSpec: path.join(openApiSpecsDir, 'openapi3WithNoComponents.yml'),
  },
];

openApiSpecs.forEach((spec) => {
  const { openApiVersion, pathToApiSpec } = spec;

  describe(`expect(res).toSatisfyApiSpec() (using an OpenAPI ${openApiVersion} spec with no response component definitions)`, () => {
    const res = {
      status: 204,
      req: {
        method: 'GET',
        path: '/endpointPath',
      },
    };

    beforeAll(() => {
      jestOpenAPI(pathToApiSpec);
    });

    it('fails', () => {
      const assertion = () => expect(res).toSatisfyApiSpec();
      expect(assertion).toThrow(
        // prettier-ignore
        joinWithNewLines(
          `expected ${red('received')} to satisfy a '204' response defined for endpoint 'GET /endpointPath' in your API spec`,
          `${red('received')} had status ${red('204')}, but your API spec has no ${red('204')} or 'default' response defined for endpoint 'GET /endpointPath'`,
        ),
      );
    });

    it('passes when using .not', () => {
      expect(res).not.toSatisfyApiSpec();
    });
  });
});
