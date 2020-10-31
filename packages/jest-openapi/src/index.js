const { openApiSpecFactory } = require('./openapi-validator');
const toSatisfyApiSpec = require('./matchers/toSatisfyApiSpec');
const toSatisfySchemaInApiSpec = require('./matchers/toSatisfySchemaInApiSpec');

module.exports = function (filepathOrObject) {
  const jestExpect = global.expect;

  const openApiSpec = openApiSpecFactory.makeApiSpec(filepathOrObject);

  const jestMatchers = {
    toSatisfyApiSpec(received) {
      return toSatisfyApiSpec.call(this, received, openApiSpec);
    },
    toSatisfySchemaInApiSpec(received, schemaName) {
      return toSatisfySchemaInApiSpec.call(
        this,
        received,
        schemaName,
        openApiSpec,
      );
    },
  };

  /* istanbul ignore next */
  if (jestExpect !== undefined) {
    jestExpect.extend(jestMatchers);
  } else {
    // eslint-disable-next-line no-console
    console.error(
      [
        "Unable to find Jest's global expect.",
        'Please check you have configured jest-openapi correctly.',
        'See https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi#usage for help.',
      ].join('\n'),
    );
  }
  /* istanbul ignore next */
};
