import chai from 'chai';
import path from 'path';

import {
  joinWithNewLines,
  str,
} from '../../../../../commonTestResources/utils';
import chaiResponseValidator from '../../..';

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/satisfySchemaInApiSpec',
);
const openApiSpecs = [
  {
    openApiVersion: 2,
    pathToApiSpec: path.join(openApiSpecsDir, 'openapi2.json'),
  },
  {
    openApiVersion: 3,
    pathToApiSpec: path.join(openApiSpecsDir, 'openapi3.yml'),
  },
];

const { expect, AssertionError } = chai;

openApiSpecs.forEach((spec) => {
  const { openApiVersion, pathToApiSpec } = spec;

  describe(`expect(obj).to.satisfySchemaInApiSpec(schemaName) (using an OpenAPI ${openApiVersion} spec)`, () => {
    before(() => {
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe("when 'obj' matches a schema defined in the API spec, such that spec expects obj to", () => {
      describe('be a string', () => {
        const schemaName = 'StringSchema';
        const expectedSchema = { type: 'string' };

        describe("'obj' satisfies the spec", () => {
          const validObj = 'string';

          it('passes', () => {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', () => {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              joinWithNewLines(
                `expected object not to satisfy the '${schemaName}' schema defined in your API spec`,
                "object was: 'string'",
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = 123;

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              joinWithNewLines(
                `expected object to satisfy the '${schemaName}' schema defined in your API spec`,
                'object did not satisfy it because: object must be string',
                'object was: 123',
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('be an integer', () => {
        const schemaName = 'IntegerSchema';
        const expectedSchema = { type: 'integer' };

        describe("'obj' satisfies the spec", () => {
          const validObj = 123;

          it('passes', () => {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', () => {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              joinWithNewLines(
                'object was: 123',
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = 'must be integer';

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              joinWithNewLines(
                'object did not satisfy it because: object must be integer',
                "object was: 'must be integer'",
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('be a simple object', () => {
        const schemaName = 'SimpleObjectSchema';
        const expectedSchema = {
          type: 'object',
          required: ['property1'],
          properties: { property1: { type: 'string' } },
        };

        describe("'obj' satisfies the spec", () => {
          const validObj = { property1: 'string' };

          it('passes', () => {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not and outputs a useful error message', () => {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              joinWithNewLines(
                `object was: ${str(validObj)}`,
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = { property1: 123 };

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              AssertionError,
              joinWithNewLines(
                `object did not satisfy it because: property1 must be string`,
                `object was: ${str(invalidObj)}`,
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('satisfy a schema referencing another schema', () => {
        const schemaName = 'SchemaReferencingAnotherSchema';
        const definitions =
          openApiVersion === 2 ? 'definitions' : 'components/schemas';
        const expectedSchema = {
          required: ['property1'],
          properties: {
            property1: { $ref: `#/${definitions}/StringSchema` },
          },
        };

        describe("'obj' satisfies the spec", () => {
          const validObj = { property1: 'string' };

          it('passes', () => {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not and outputs a useful error message', () => {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              AssertionError,
              joinWithNewLines(
                `object was: ${str(validObj)}`,
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = { property1: 123 };

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              joinWithNewLines(
                `object did not satisfy it because: property1 must be string`,
                `object was: ${str(invalidObj)}`,
                `The '${schemaName}' schema in API spec: ${str(
                  expectedSchema,
                )}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('satisfy allOf 2 schemas', () => {
        const schemaName = 'SchemaUsingAllOf';

        describe("'obj' satisfies the spec", () => {
          const validObj = { property1: 'string', property2: 'string' };

          it('passes', () => {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', () => {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              AssertionError,
              'expected object not to satisfy',
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = { property1: 'string', property2: 123 };

          it('fails', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              AssertionError,
              'object did not satisfy it because: property2 must be string',
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      if (openApiVersion === 3) {
        describe('satisfy anyOf 2 schemas', () => {
          const schemaName = 'SchemaUsingAnyOf';

          describe("'obj' satisfies the spec", () => {
            const validObj = { property1: 123, property2: 'string' };

            it('passes', () => {
              expect(validObj).to.satisfySchemaInApiSpec(schemaName);
            });

            it('fails when using .not', () => {
              const assertion = () =>
                expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                AssertionError,
                'expected object not to satisfy',
              );
            });
          });

          describe("'obj' does not satisfy the spec", () => {
            const invalidObj = { property1: 123, property2: 123 };

            it('fails and outputs a useful error message', () => {
              const assertion = () =>
                expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                AssertionError,
                'object did not satisfy it because: property1 must be string, property2 must be string, object must match a schema in anyOf',
              );
            });

            it('passes when using .not', () => {
              expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
            });
          });
        });

        describe('satisfy oneOf 2 schemas', () => {
          const schemaName = 'SchemaUsingOneOf';

          describe("'obj' satisfies the spec", () => {
            const validObj = { property1: 123, property2: 'string' };

            it('passes', () => {
              expect(validObj).to.satisfySchemaInApiSpec(schemaName);
            });

            it('fails when using .not', () => {
              const assertion = () =>
                expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                AssertionError,
                'expected object not to satisfy',
              );
            });
          });

          describe("'obj' does not satisfy the spec", () => {
            const invalidObj = { property1: 'string', property2: 'string' };

            it('fails and outputs a useful error message', () => {
              const assertion = () =>
                expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                AssertionError,
                'object did not satisfy it because: object must match exactly one schema in oneOf',
              );
            });

            it('passes when using .not', () => {
              expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
            });
          });
        });
      }
    });

    describe("when 'obj' matches NO schemas defined in the API spec", () => {
      const obj = 'foo';

      it('fails', () => {
        const assertion = () =>
          expect(obj).to.satisfySchemaInApiSpec('NonExistentSchema');
        expect(assertion).to.throw(
          AssertionError,
          'The argument to satisfySchemaInApiSpec must match a schema in your API spec',
        );
      });

      it('fails when using .not', () => {
        const assertion = () =>
          expect(obj).to.not.satisfySchemaInApiSpec('NonExistentSchema');
        expect(assertion).to.throw(
          AssertionError,
          'The argument to satisfySchemaInApiSpec must match a schema in your API spec',
        );
      });
    });
  });
});
