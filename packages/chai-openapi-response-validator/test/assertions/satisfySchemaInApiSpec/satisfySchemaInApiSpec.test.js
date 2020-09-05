const chai = require('chai');
const path = require('path');
const util = require('util');
const { c } = require('compress-tag');

const chaiResponseValidator = require('../../..');

const str = (obj) => util.inspect(obj, { showHidden: false, depth: null });
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
              c`expected object not to satisfy the '${schemaName}' schema defined in your API spec
              \nobject was: 'string'
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = 123;

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              c`expected object to satisfy the '${schemaName}' schema defined in your API spec
              \nobject did not satisfy it because: object should be string
            \n\nobject was: 123
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
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
              c`expected object not to satisfy the '${schemaName}' schema defined in your API spec
              \nobject was: 123
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = 'should be integer';

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              c`expected object to satisfy the '${schemaName}' schema defined in your API spec
              \nobject did not satisfy it because: object should be integer
            \n\nobject was: 'should be integer'
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
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
              c`object was: ${str(validObj)}
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
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
              c`object did not satisfy it because: property1 should be string
            \n\nobject was: ${str(invalidObj)}
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
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
              c`object was: ${str(validObj)}
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = { property1: 123 };

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              c`object did not satisfy it because: property1 should be string
            \n\nobject was: ${str(invalidObj)}
            \n\nThe '${schemaName}' schema in API spec: ${str(expectedSchema)}`,
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
              'object did not satisfy it because: property2 should be string',
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
                'object did not satisfy it because: property1 should be string, property2 should be string, object should match some schema in anyOf',
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
                'object did not satisfy it because: object should match exactly one schema in oneOf',
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
