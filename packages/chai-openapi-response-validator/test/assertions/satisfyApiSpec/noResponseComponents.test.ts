import chai from 'chai';
import path from 'path';

import { joinWithNewLines } from '../../../../../commonTestResources/utils';
import chaiResponseValidator from '../../..';

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

const { expect } = chai;

openApiSpecs.forEach((spec) => {
  const { openApiVersion, pathToApiSpec } = spec;

  describe(`expect(res).to.satisfyApiSpec (using an OpenAPI ${openApiVersion} spec with no response component definitions)`, () => {
    const res = {
      status: 204,
      req: {
        method: 'GET',
        path: '/endpointPath',
      },
    };

    before(() => {
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    it('fails', () => {
      const assertion = () => expect(res).to.satisfyApiSpec;
      expect(assertion).to.throw(
        joinWithNewLines(
          "expected res to satisfy a '204' response defined for endpoint 'GET /endpointPath' in your API spec",
          "res had status '204', but your API spec has no '204' or 'default' response defined for endpoint 'GET /endpointPath'",
        ),
      );
    });

    it('passes when using .not', () => {
      expect(res).not.to.satisfyApiSpec;
    });
  });
});
