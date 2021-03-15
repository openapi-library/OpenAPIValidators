import {
  RECEIVED_COLOR,
  EXPECTED_COLOR,
  matcherHint,
  matcherErrorMessage,
  printExpected,
  printWithType,
} from 'jest-matcher-utils';

import { stringify, joinWithNewLines } from '../utils';

export default function (received, schemaName, openApiSpec) {
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
  received,
  schemaName,
  schema,
  validationError,
  hint,
) {
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
  received,
  schemaName,
  schema,
  hint,
) {
  // prettier-ignore
  return joinWithNewLines(
    hint,
    `expected ${RECEIVED_COLOR('received')} not to satisfy the '${schemaName}' schema defined in your API spec`,
    `${RECEIVED_COLOR('received')} was: ${RECEIVED_COLOR(stringify(received))}`,
    `The '${schemaName}' schema in API spec: ${EXPECTED_COLOR(stringify(schema))}`,
  );
}
