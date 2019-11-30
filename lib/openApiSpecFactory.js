const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const OpenAPISchemaValidator = require('openapi-schema-validator').default;

const utils = require('./utils');
const OpenApi2Spec = require('./classes/OpenApi2Spec');
const OpenApi3Spec = require('./classes/OpenApi3Spec');

function makeApiSpec(filepath) {
  const spec = loadFile(filepath);
  validateSpec(spec);
  if (getOpenApiVersion(spec) === '2.0') {
    return new OpenApi2Spec(spec);
  }
  // if (getOpenApiVersion(spec).startsWith('3.'))
  return new OpenApi3Spec(spec);
}

function loadFile(filepath) {
  if (!path.isAbsolute(filepath)) {
    throw new Error('The "path" argument must be an absolute filepath');
  }
  const fileData = fs.readFileSync(filepath);
  try {
    return yaml.safeLoad(fileData);
  } catch (error) {
    throw new Error(`Unable to read the specified OpenAPI document. File is invalid YAML or JSON:\n${error.message}`);
  }
}

function validateSpec(spec) {
  try {
    const validator = new OpenAPISchemaValidator({ version: getOpenApiVersion(spec) });
    const { errors } = validator.validate(spec);
    if (errors.length > 0) {
      throw new Error(utils.stringify(errors));
    }
  } catch (error) {
    throw new Error(`File is not a valid OpenAPI spec.\nError(s): ${error.message}`);
  }

}

function getOpenApiVersion(openApiSpec) {
  return openApiSpec.swagger // '2.0'
   || openApiSpec.openapi; // '3.X.X'
}


module.exports = {
  makeApiSpec,
};
