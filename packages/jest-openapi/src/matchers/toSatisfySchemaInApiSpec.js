const { c } = require('compress-tag');
const {
  RECEIVED_COLOR,
  EXPECTED_COLOR,
  matcherHint,
  matcherErrorMessage,
  printExpected,
  printWithType,
} = require('jest-matcher-utils');

const { stringify } = require('../utils');

module.exports = function (received, schemaName, openApiSpec) {
  const matcherHintOptions = {
    comment: 'Matches \'received\' to a schema defined in your API spec, then validates \'received\' against it',
    isNot: this.isNot,
    promise: this.promise,
  };
  const hint = matcherHint('toSatisfySchemaInApiSpec', undefined, 'schemaName', matcherHintOptions);

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
    ? () => getExpectReceivedNotToSatisfySchemaInApiSpecMsg(received, schemaName, schema, hint)
    : () => getExpectReceivedToSatisfySchemaInApiSpecMsg(received, schemaName, schema, validationError, hint);

  return {
    pass,
    message,
  };
};

function getExpectReceivedToSatisfySchemaInApiSpecMsg(received, schemaName, schema, validationError, hint) {
  return c`${hint}
    \n\nexpected ${RECEIVED_COLOR('received')} to satisfy the '${schemaName}' schema defined in your API spec
    \n${RECEIVED_COLOR('received')} did not satisfy it because: ${validationError}
    \n\n${RECEIVED_COLOR('received')} was: ${RECEIVED_COLOR(stringify(received))}
    \n\nThe '${schemaName}' schema in API spec: ${EXPECTED_COLOR(stringify(schema))}`;
}

function getExpectReceivedNotToSatisfySchemaInApiSpecMsg(received, schemaName, schema, hint) {
  return c`${hint}
    \n\nexpected ${RECEIVED_COLOR('received')} not to satisfy the '${schemaName}' schema defined in your API spec
    \n${RECEIVED_COLOR('received')} was: ${RECEIVED_COLOR(stringify(received))}
    \n\nThe '${schemaName}' schema in API spec: ${EXPECTED_COLOR(stringify(schema))}`;
}
