const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const typeOf = require('typeof');

const utils = require('./utils');
const OpenApi2Spec = require('./classes/OpenApi2Spec');
const OpenApi3Spec = require('./classes/OpenApi3Spec');

function makeApiSpec(filepathOrObject) {
  const spec = loadSpec(filepathOrObject);
  validateSpec(spec);
  if (getOpenApiVersion(spec) === '2.0') {
    return new OpenApi2Spec(spec);
  }
  // if (getOpenApiVersion(spec).startsWith('3.'))
  return new OpenApi3Spec(spec);
}

function loadSpec(arg) {
  const argType = typeOf(arg);
  try {
    if (argType === 'string') {
      return loadFile(arg);
    }
    if (argType === 'object') {
      return arg;
    }
    throw new Error(`Received type '${argType}'`);
  } catch (error) {
    throw new Error('The provided argument must be either an absolute filepath or '
     + `an object representing an OpenAPI specification.\nError details: ${error.message}`);
  }
}

function loadFile(filepath) {
  if (!path.isAbsolute(filepath)) {
    throw new Error(`'${filepath}' is not an absolute filepath`);
  }
  const fileData = fs.readFileSync(filepath);
  try {
    return yaml.safeLoad(fileData);
  } catch (error) {
    throw new Error(`Invalid YAML or JSON:\n${error.message}`);
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
    throw new Error(`Invalid OpenAPI spec: ${error.message}`);
  }
}

function getOpenApiVersion(openApiSpec) {
  return openApiSpec.swagger // '2.0'
   || openApiSpec.openapi; // '3.X.X'
}


module.exports = {
  makeApiSpec,
};
