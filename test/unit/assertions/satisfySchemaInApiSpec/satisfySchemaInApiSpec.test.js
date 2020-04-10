const chai = require('chai');
const path = require('path');
const { inspect } = require('util');

const chaiResponseValidator = require('../../../..');

const openApiSpecsDir = path.resolve('test', 'resources', 'exampleOpenApiFiles', 'valid', 'satisfySchemaInApiSpec');
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

for (const spec of openApiSpecs) {
  const { openApiVersion, pathToApiSpec } = spec;

  describe(`expect(obj).to.satisfySchemaInApiSpec(schemaName) (using an OpenAPI ${openApiVersion} spec)`, function () {

    before(function () {
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('when \'obj\' matches a schema defined in the API spec, such that spec expects obj to', function () {

      describe('be a string', function () {
        const schemaName = 'StringSchema';

        describe('\'obj\' satisfies the spec', function () {
          const validObj = 'string';

          it('passes', function () {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', function () {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object not to satisfy schema '${schemaName}'`
                + ` defined in OpenAPI spec\nobject: ${inspect(validObj)}`
            );
          });
        });

        describe('\'obj\' does not satisfy the spec', function () {
          const invalidObj = 123;

          it('fails and outputs a useful error message', function () {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object to satisfy schema '${schemaName}' defined in API spec:\n${inspect({
                message: 'The object was not valid.',
                errors: [
                  {
                    errorCode: 'type.openapi.objectValidation',
                    message: 'object should be string',
                  },
                ],
                actualObject: invalidObj,
              })}`
            );
          });

          it('passes when using .not', function () {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('be an integer', function () {
        const schemaName = 'IntegerSchema';

        describe('\'obj\' satisfies the spec', function () {
          const validObj = 123;

          it('passes', function () {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', function () {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object not to satisfy schema '${schemaName}'`
                + ` defined in OpenAPI spec\nobject: ${inspect(validObj)}`
            );
          });
        });

        describe('\'obj\' does not satisfy the spec', function () {
          const invalidObj = 'should be integer';

          it('fails and outputs a useful error message', function () {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object to satisfy schema '${schemaName}' defined in API spec:\n${inspect({
                message: 'The object was not valid.',
                errors: [
                  {
                    errorCode: 'type.openapi.objectValidation',
                    message: 'object should be integer',
                  },
                ],
                actualObject: invalidObj,
              })}`
            );
          });

          it('passes when using .not', function () {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('be a simple object', function () {
        const schemaName = 'SimpleObjectSchema';

        describe('\'obj\' satisfies the spec', function () {
          const validObj = { property1: 'string' };

          it('passes', function () {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', function () {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object not to satisfy schema '${schemaName}'`
                + ` defined in OpenAPI spec\nobject: ${inspect(validObj)}`
            );
          });
        });

        describe('\'obj\' does not satisfy the spec', function () {
          const invalidObj = { property1: 123 };

          it('fails and outputs a useful error message', function () {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object to satisfy schema '${schemaName}' defined in API spec:\n${inspect({
                message: 'The object was not valid.',
                errors: [
                  {
                    errorCode: 'type.openapi.objectValidation',
                    message: 'property1 should be string',
                  },
                ],
                actualObject: invalidObj,
              })}`
            );
          });

          it('passes when using .not', function () {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('satisfy a schema referencing another schema', function () {
        const schemaName = 'SchemaReferencingAnotherSchema';

        describe('\'obj\' satisfies the spec', function () {
          const validObj = { property1: 'string' };

          it('passes', function () {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', function () {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object not to satisfy schema '${schemaName}'`
                + ` defined in OpenAPI spec\nobject: ${inspect(validObj)}`
            );
          });
        });

        describe('\'obj\' does not satisfy the spec', function () {
          const invalidObj = { property1: 123 };

          it('fails and outputs a useful error message', function () {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object to satisfy schema '${schemaName}' defined in API spec:\n${inspect({
                message: 'The object was not valid.',
                errors: [
                  {
                    errorCode: 'type.openapi.objectValidation',
                    message: 'property1 should be string',
                  },
                ],
                actualObject: invalidObj,
              })}`
            );
          });

          it('passes when using .not', function () {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      describe('satisfy allOf 2 schemas', function () {
        const schemaName = 'SchemaUsingAllOf';

        describe('\'obj\' satisfies the spec', function () {
          const validObj = { property1: 'string', property2: 'string' };

          it('passes', function () {
            expect(validObj).to.satisfySchemaInApiSpec(schemaName);
          });

          it('fails when using .not', function () {
            const assertion = () =>
              expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object not to satisfy schema '${schemaName}'`
                + ` defined in OpenAPI spec\nobject: ${inspect(validObj)}`
            );
          });
        });

        describe('\'obj\' does not satisfy the spec', function () {
          const invalidObj = { property1: 'string', property2: 123 };

          it('fails and outputs a useful error message', function () {
            const assertion = () =>
              expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
            expect(assertion).to.throw(
              `expected object to satisfy schema '${schemaName}' defined in API spec:\n${inspect({
                message: 'The object was not valid.',
                errors: [
                  {
                    errorCode: 'type.openapi.objectValidation',
                    message: 'property2 should be string',
                  },
                ],
                actualObject: invalidObj,
              })}`
            );
          });

          it('passes when using .not', function () {
            expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
          });
        });
      });

      if (openApiVersion === 3) {
        describe('satisfy anyOf 2 schemas', function () {
          const schemaName = 'SchemaUsingAnyOf';

          describe('\'obj\' satisfies the spec', function () {
            const validObj = { property1: 123, property2: 'string' };

            it('passes', function () {
              expect(validObj).to.satisfySchemaInApiSpec(schemaName);
            });

            it('fails when using .not', function () {
              const assertion = () =>
                expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                `expected object not to satisfy schema '${schemaName}'`
                  + ` defined in OpenAPI spec\nobject: ${inspect(validObj)}`
              );
            });
          });

          describe('\'obj\' does not satisfy the spec', function () {
            const invalidObj = { property1: 123, property2: 123 };

            it('fails and outputs a useful error message', function () {
              const assertion = () =>
                expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                `expected object to satisfy schema '${schemaName}' defined in API spec:\n${inspect({
                  message: 'The object was not valid.',
                  errors: [
                    {
                      errorCode: 'type.openapi.objectValidation',
                      message: 'property1 should be string',
                    },
                    {
                      errorCode: 'type.openapi.objectValidation',
                      message: 'property2 should be string',
                    },
                    {
                      errorCode: 'type.openapi.objectValidation',
                      message: 'object should match some schema in anyOf',
                    },
                  ],
                  actualObject: { property1: 123, property2: 123 },
                })}`
              );
            });

            it('passes when using .not', function () {
              expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
            });
          });
        });

        describe('satisfy oneOf 2 schemas', function () {
          const schemaName = 'SchemaUsingOneOf';

          describe('\'obj\' satisfies the spec', function () {
            const validObj = { property1: 123, property2: 'string' };

            it('passes', function () {
              expect(validObj).to.satisfySchemaInApiSpec(schemaName);
            });

            it('fails when using .not', function () {
              const assertion = () =>
                expect(validObj).to.not.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                `expected object not to satisfy schema '${schemaName}'`
                  + ` defined in OpenAPI spec\nobject: ${inspect(validObj)}`
              );
            });
          });

          describe('\'obj\' does not satisfy the spec', function () {
            const invalidObj = { property1: 'string', property2: 'string' };

            it('fails and outputs a useful error message', function () {
              const assertion = () =>
                expect(invalidObj).to.satisfySchemaInApiSpec(schemaName);
              expect(assertion).to.throw(
                `expected object to satisfy schema '${schemaName}' defined in API spec:\n${inspect({
                  message: 'The object was not valid.',
                  errors: [
                    {
                      errorCode: 'type.openapi.objectValidation',
                      message: 'object should match exactly one schema in oneOf',
                    },
                  ],
                  actualObject: invalidObj,
                })}`
              );
            });

            it('passes when using .not', function () {
              expect(invalidObj).to.not.satisfySchemaInApiSpec(schemaName);
            });
          });
        });
      }
    });

    describe('when \'obj\' matches NO schemas defined in the API spec', function () {
      const obj = 'foo';

      it('fails', function () {
        const assertion = () =>
          expect(obj).to.satisfySchemaInApiSpec('NonExistentSchema');
        expect(assertion).to.throw(AssertionError, 'The argument to satisfySchemaInApiSpec must match a schema in your API spec');
      });

      it('fails when using .not', function () {
        const assertion = () =>
          expect(obj).to.not.satisfySchemaInApiSpec('NonExistentSchema');
        expect(assertion).to.throw(AssertionError, 'The argument to satisfySchemaInApiSpec must match a schema in your API spec');
      });
    });

  });

}
