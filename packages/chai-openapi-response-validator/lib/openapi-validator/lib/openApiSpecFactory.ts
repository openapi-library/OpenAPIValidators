import fs from 'fs-extra';
import yaml from 'js-yaml';
import path from 'path';
import OpenAPISchemaValidator from 'openapi-schema-validator';
import typeOf from 'typeof';
import OpenApi2Spec from './classes/OpenApi2Spec';
import OpenApi3Spec from './classes/OpenApi3Spec';
import { stringify } from './utils';

const isOpenApi2Spec = (spec) => getOpenApiVersion(spec) === '2.0';

export default (filepathOrObject) => {
  const spec = loadSpec(filepathOrObject);
  validateSpec(spec);
  return isOpenApi2Spec(spec) ? new OpenApi2Spec(spec) : new OpenApi3Spec(spec);
};

const isString = (arg) => typeOf(arg) === 'string';
const isObject = (arg) => typeOf(arg) === 'object';

function loadSpec(arg) {
  try {
    if (isString(arg)) {
      return loadFile(arg);
    }
    if (isObject(arg)) {
      return arg;
    }
    throw new Error(`Received type '${typeOf(arg)}'`);
  } catch (error) {
    throw new Error(
      'The provided argument must be either an absolute filepath or ' +
        `an object representing an OpenAPI specification.\nError details: ${error.message}`,
    );
  }
}

function loadFile(filepath) {
  if (!path.isAbsolute(filepath)) {
    throw new Error(`'${filepath}' is not an absolute filepath`);
  }
  const fileData = fs.readFileSync(filepath, 'utf8');
  try {
    return yaml.safeLoad(fileData);
  } catch (error) {
    throw new Error(`Invalid YAML or JSON:\n${error.message}`);
  }
}

function validateSpec(spec) {
  try {
    const validator = new OpenAPISchemaValidator({
      version: getOpenApiVersion(spec),
    });
    const { errors } = validator.validate(spec);
    if (errors.length) {
      throw new Error(stringify(errors));
    }
  } catch (error) {
    throw new Error(`Invalid OpenAPI spec: ${error.message}`);
  }
}

function getOpenApiVersion(openApiSpec) {
  return (
    openApiSpec.swagger || // '2.0'
    openApiSpec.openapi // '3.X.X'
  );
}
