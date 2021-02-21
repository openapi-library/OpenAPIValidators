const path = require('path');
const jestMatcherUtils = require('jest-matcher-utils');

const {
  joinWithNewLines,
  str,
} = require('../../../../../commonTestResources/utils');
const jestOpenAPI = require('../../..');

const expectReceivedToSatisfySchemaInApiSpec = jestMatcherUtils.matcherHint(
  'toSatisfySchemaInApiSpec',
  undefined,
  'schemaName',
  {
    comment:
      "Matches 'received' to a schema defined in your API spec, then validates 'received' against it",
    isNot: false,
  },
);

const expectReceivedNotToSatisfySchemaInApiSpec = jestMatcherUtils.matcherHint(
  'toSatisfySchemaInApiSpec',
  undefined,
  'schemaName',
  {
    comment:
      "Matches 'received' to a schema defined in your API spec, then validates 'received' against it",
    isNot: true,
  },
);

const red = jestMatcherUtils.RECEIVED_COLOR;
const green = jestMatcherUtils.EXPECTED_COLOR;

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

openApiSpecs.forEach((spec) => {
  const { openApiVersion, pathToApiSpec } = spec;

  describe(`expect(obj).toSatisfySchemaInApiSpec(schemaName) (using an OpenAPI ${openApiVersion} spec)`, () => {
    beforeAll(() => {
      jestOpenAPI(pathToApiSpec);
    });

    describe("when 'obj' matches a schema defined in the API spec, such that spec expects obj to", () => {
      describe('be a string', () => {
        const schemaName = 'StringSchema';
        const expectedSchema = { type: 'string' };

        describe("'obj' satisfies the spec", () => {
          const validObj = 'string';

          it('passes', () => {
            expect(validObj).toSatisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', () => {
            const assertion = () =>
              expect(validObj).not.toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              new Error(
                // prettier-ignore
                joinWithNewLines(
                  expectReceivedNotToSatisfySchemaInApiSpec,
                  `expected ${red('received')} not to satisfy the '${schemaName}' schema defined in your API spec`,
                  `${red('received')} was: ${red('\'string\'')}`,
                  `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
                ),
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = 123;

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              new Error(
                // prettier-ignore
                joinWithNewLines(
                  expectReceivedToSatisfySchemaInApiSpec,
                  `expected ${red('received')} to satisfy the '${schemaName}' schema defined in your API spec`,
                  `${red('received')} did not satisfy it because: object should be string`,
                  `${red('received')} was: ${red(123)}`,
                  `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
                ),
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).not.toSatisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('be an integer', () => {
        const schemaName = 'IntegerSchema';
        const expectedSchema = { type: 'integer' };

        describe("'obj' satisfies the spec", () => {
          const validObj = 123;

          it('passes', () => {
            expect(validObj).toSatisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', () => {
            const assertion = () =>
              expect(validObj).not.toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              // prettier-ignore
              joinWithNewLines(
                `${red('received')} was: ${red(123)}`,
                `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = 'should be integer';

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              // prettier-ignore
              joinWithNewLines(
                `${red('received')} did not satisfy it because: object should be integer`,
                `${red('received')} was: ${red('\'should be integer\'')}`,
                `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).not.toSatisfySchemaInApiSpec(schemaName);
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
            expect(validObj).toSatisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not and outputs a useful error message', () => {
            const assertion = () =>
              expect(validObj).not.toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              // prettier-ignore
              joinWithNewLines(
                `${red('received')} was: ${red(str(validObj))}`,
                `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = { property1: 123 };

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              // prettier-ignore
              joinWithNewLines(
                `${red('received')} did not satisfy it because: property1 should be string`,
                `${red('received')} was: ${red(str(invalidObj))}`,
                `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).not.toSatisfySchemaInApiSpec(schemaName);
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
            expect(validObj).toSatisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not and outputs a useful error message', () => {
            const assertion = () =>
              expect(validObj).not.toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              // prettier-ignore
              joinWithNewLines(
                `${red('received')} was: ${red(str(validObj))}`,
                `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
              ),
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = { property1: 123 };

          it('fails and outputs a useful error message', () => {
            const assertion = () =>
              expect(invalidObj).toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              // prettier-ignore
              joinWithNewLines(
                `${red('received')} did not satisfy it because: property1 should be string`,
                `${red('received')} was: ${red(str(invalidObj))}`,
                `The '${schemaName}' schema in API spec: ${green(str(expectedSchema))}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).not.toSatisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('satisfy allOf 2 schemas', () => {
        const schemaName = 'SchemaUsingAllOf';

        describe("'obj' satisfies the spec", () => {
          const validObj = { property1: 'string', property2: 'string' };

          it('passes', () => {
            expect(validObj).toSatisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', () => {
            const assertion = () =>
              expect(validObj).not.toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              `expected ${red('received')} not to satisfy`,
            );
          });
        });

        describe("'obj' does not satisfy the spec", () => {
          const invalidObj = { property1: 'string', property2: 123 };

          it('fails', () => {
            const assertion = () =>
              expect(invalidObj).toSatisfySchemaInApiSpec(schemaName);
            expect(assertion).toThrow(
              // prettier-ignore
              `${red('received')} did not satisfy it because: property2 should be string`,
            );
          });

          it('passes when using .not', () => {
            expect(invalidObj).not.toSatisfySchemaInApiSpec(schemaName);
          });
        });
      });

      if (openApiVersion === 3) {
        describe('satisfy anyOf 2 schemas', () => {
          const schemaName = 'SchemaUsingAnyOf';

          describe("'obj' satisfies the spec", () => {
            const validObj = { property1: 123, property2: 'string' };

            it('passes', () => {
              expect(validObj).toSatisfySchemaInApiSpec(schemaName);
            });

            it('fails when using .not', () => {
              const assertion = () =>
                expect(validObj).not.toSatisfySchemaInApiSpec(schemaName);
              expect(assertion).toThrow(
                `expected ${red('received')} not to satisfy`,
              );
            });
          });

          describe("'obj' does not satisfy the spec", () => {
            const invalidObj = { property1: 123, property2: 123 };

            it('fails and outputs a useful error message', () => {
              const assertion = () =>
                expect(invalidObj).toSatisfySchemaInApiSpec(schemaName);
              expect(assertion).toThrow(
                // prettier-ignore
                `${red('received')} did not satisfy it because: property1 should be string, property2 should be string, object should match some schema in anyOf`,
              );
            });

            it('passes when using .not', () => {
              expect(invalidObj).not.toSatisfySchemaInApiSpec(schemaName);
            });
          });
        });

        describe('satisfy oneOf 2 schemas', () => {
          const schemaName = 'SchemaUsingOneOf';

          describe("'obj' satisfies the spec", () => {
            const validObj = { property1: 123, property2: 'string' };

            it('passes', () => {
              expect(validObj).toSatisfySchemaInApiSpec(schemaName);
            });

            it('fails when using .not', () => {
              const assertion = () =>
                expect(validObj).not.toSatisfySchemaInApiSpec(schemaName);
              expect(assertion).toThrow(
                `expected ${red('received')} not to satisfy`,
              );
            });
          });

          describe("'obj' does not satisfy the spec", () => {
            const invalidObj = { property1: 'string', property2: 'string' };

            it('fails and outputs a useful error message', () => {
              const assertion = () =>
                expect(invalidObj).toSatisfySchemaInApiSpec(schemaName);
              expect(assertion).toThrow(
                // prettier-ignore
                `${red('received')} did not satisfy it because: object should match exactly one schema in oneOf`,
              );
            });

            it('passes when using .not', () => {
              expect(invalidObj).not.toSatisfySchemaInApiSpec(schemaName);
            });
          });
        });
      }
    });

    describe("when 'obj' matches NO schemas defined in the API spec", () => {
      const obj = 'foo';

      const {
        matcherErrorMessage,
        printWithType,
        printExpected,
      } = jestMatcherUtils;

      it('fails', () => {
        const assertion = () =>
          expect(obj).toSatisfySchemaInApiSpec('NonExistentSchema');
        expect(assertion).toThrow(
          new Error(
            matcherErrorMessage(
              expectReceivedToSatisfySchemaInApiSpec,
              `${green('schemaName')} must match a schema in your API spec`,
              printWithType('schemaName', 'NonExistentSchema', printExpected),
            ),
          ),
        );
      });

      it('fails when using .not', () => {
        const assertion = () =>
          expect(obj).not.toSatisfySchemaInApiSpec('NonExistentSchema');
        expect(assertion).toThrow(
          new Error(
            matcherErrorMessage(
              expectReceivedNotToSatisfySchemaInApiSpec,
              `${green('schemaName')} must match a schema in your API spec`,
              printWithType('schemaName', 'NonExistentSchema', printExpected),
            ),
          ),
        );
      });
    });
  });
});
