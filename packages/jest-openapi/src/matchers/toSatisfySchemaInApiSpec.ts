import {
  EXPECTED_COLOR,
  matcherErrorMessage,
  matcherHint,
  printExpected,
  printWithType,
  RECEIVED_COLOR,
} from 'jest-matcher-utils';
import type { OpenApiSpec, Schema, ValidationError } from 'openapi-validator';
import { joinWithNewLines, stringify } from '../utils';

export default function (
  this: jest.MatcherContext,
  received: unknown,
  schemaName: string,
  openApiSpec: OpenApiSpec,
): jest.CustomMatcherResult {
  const matcherHintOptions = {
    comment:
      "Matches 'received' to a schema defined in your API spec, then validates 'received' against it",
    isNot: this.isNot,
    promise: this.promise,
  };
  const hint = matcherHint(
    'toSatisfySchemaInApiSpec',
    undefined,
    'schemaName',
    matcherHintOptions,
  );

  const schema = openApiSpec.getSchemaObject(schemaName);
  if (!schema) {
    // alert users they are misusing this assertion
    throw new Error(
      matcherErrorMessage(
        hint,
        `${EXPECTED_COLOR('schemaName')} must match a schema in your API spec`,
        printWithType('schemaName', schemaName, printExpected),
      ),
    );
  }

  const validationError = openApiSpec.validateObject(received, schema);
  const pass = !validationError;

  const message = pass
    ? () =>
        getExpectReceivedNotToSatisfySchemaInApiSpecMsg(
          received,
          schemaName,
          schema,
          hint,
        )
    : () =>
        getExpectReceivedToSatisfySchemaInApiSpecMsg(
          received,
          schemaName,
          schema,
          validationError,
          hint,
        );

  return {
    pass,
    message,
  };
}

function getExpectReceivedToSatisfySchemaInApiSpecMsg(
  received: unknown,
  schemaName: string,
  schema: Schema,
  validationError: ValidationError,
  hint: string,
): string {
  // prettier-ignore
  return joinWithNewLines(
    hint,
    `expected ${RECEIVED_COLOR('received')} to satisfy the '${schemaName}' schema defined in your API spec`,
    `${RECEIVED_COLOR('received')} did not satisfy it because: ${validationError}`,
    `${RECEIVED_COLOR('received')} was: ${RECEIVED_COLOR(stringify(received))}`,
    `The '${schemaName}' schema in API spec: ${EXPECTED_COLOR(stringify(schema))}`,
  );
}

function getExpectReceivedNotToSatisfySchemaInApiSpecMsg(
  received: unknown,
  schemaName: string,
  schema: Schema,
  hint: string,
): string {
  // prettier-ignore
  return joinWithNewLines(
    hint,
    `expected ${RECEIVED_COLOR('received')} not to satisfy the '${schemaName}' schema defined in your API spec`,
    `${RECEIVED_COLOR('received')} was: ${RECEIVED_COLOR(stringify(received))}`,
    `The '${schemaName}' schema in API spec: ${EXPECTED_COLOR(stringify(schema))}`,
  );
}
