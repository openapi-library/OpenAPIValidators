import type { OpenApiSpec, Schema, ValidationError } from 'openapi-validator';
import { stringify, joinWithNewLines } from '../utils';

export default function (
  chai: Chai.ChaiStatic,
  openApiSpec: OpenApiSpec,
): void {
  const { Assertion, AssertionError } = chai;

  Assertion.addMethod('satisfySchemaInApiSpec', function (schemaName) {
    const actualObject = this._obj; // eslint-disable-line no-underscore-dangle

    const schema = openApiSpec.getSchemaObject(schemaName);
    if (!schema) {
      // alert users they are misusing this assertion
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new AssertionError(
        'The argument to satisfySchemaInApiSpec must match a schema in your API spec',
      );
    }

    const validationError = openApiSpec.validateObject(actualObject, schema);
    const predicate = !validationError;
    this.assert(
      predicate,
      getExpectReceivedToSatisfySchemaInApiSpecMsg(
        actualObject,
        schemaName,
        schema,
        validationError,
      ),
      getExpectReceivedNotToSatisfySchemaInApiSpecMsg(
        actualObject,
        schemaName,
        schema,
      ),
      null,
    );
  });
}

function getExpectReceivedToSatisfySchemaInApiSpecMsg(
  received: unknown,
  schemaName: string,
  schema: Schema,
  validationError: ValidationError,
) {
  return joinWithNewLines(
    `expected object to satisfy the '${schemaName}' schema defined in your API spec`,
    `object did not satisfy it because: ${validationError}`,
    `object was: ${stringify(received)}`,
    `The '${schemaName}' schema in API spec: ${stringify(schema)}`,
  );
}

function getExpectReceivedNotToSatisfySchemaInApiSpecMsg(
  received: unknown,
  schemaName: string,
  schema: Schema,
) {
  return joinWithNewLines(
    `expected object not to satisfy the '${schemaName}' schema defined in your API spec`,
    `object was: ${stringify(received)}`,
    `The '${schemaName}' schema in API spec: ${stringify(schema)}`,
  );
}
