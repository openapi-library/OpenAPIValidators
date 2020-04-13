const { c } = require('compress-tag');

const { stringify } = require('../utils');

module.exports = function(chai, openApiSpec) {

  const { Assertion, AssertionError } = chai;

  Assertion.addMethod('satisfySchemaInApiSpec', function (schemaName) {
    const actualObject = this._obj;

    const schema = openApiSpec.getSchemaObject(schemaName);
    if (!schema) {
      // alert users they are misusing this assertion
      throw new AssertionError('The argument to satisfySchemaInApiSpec must match a schema in your API spec');
    }

    const validationError = openApiSpec.validateObject(actualObject, schema);
    const predicate = !validationError;
    this.assert(
      predicate,

      c`expected object to satisfy the '${schemaName}' schema defined in your API spec
      \nobject did not satisfy it because: ${validationError}
      \n\nobject was: ${stringify(actualObject)}
      \n\nThe '${schemaName}' schema in API spec: ${stringify(schema)}`,

      c`expected object not to satisfy the '${schemaName}' schema defined in your API spec
      \nobject was: ${stringify(actualObject)}
      \n\nThe '${schemaName}' schema in API spec: ${stringify(schema)}`,
    );
  });

};
