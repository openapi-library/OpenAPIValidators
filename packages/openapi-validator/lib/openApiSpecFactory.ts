import fs from 'fs-extra';
import yaml from 'js-yaml';
import OpenAPISchemaValidator from 'openapi-schema-validator';
import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import path from 'path';
import typeOf from 'typeof';
import OpenApi2Spec from './classes/OpenApi2Spec';
import OpenApi3Spec from './classes/OpenApi3Spec';
import { stringify } from './utils/common.utils';

type AnyObject = Record<string, unknown>;

const isObject = (arg: unknown): arg is AnyObject =>
  typeof arg === 'object' && arg !== null && !Array.isArray(arg);

export default function makeApiSpec(
  filepathOrObject: string | OpenAPI.Document,
): OpenApi2Spec | OpenApi3Spec {
  const spec = loadSpec(filepathOrObject);
  validateSpec(spec);
  const validSpec = spec as OpenAPI.Document;
  if ('swagger' in validSpec) {
    return new OpenApi2Spec(validSpec);
  }
  return new OpenApi3Spec(validSpec as OpenAPIV3.Document);
}

function loadSpec(arg: unknown): AnyObject {
  try {
    if (typeof arg === 'string') {
      return loadFile(arg);
    }
    if (isObject(arg)) {
      return arg;
    }
    throw new Error(`Received type '${typeOf(arg)}'`);
  } catch (error) {
    throw new Error(
      `The provided argument must be either an absolute filepath or an object representing an OpenAPI specification.\nError details: ${
        (error as Error).message
      }`,
    );
  }
}

function loadFile(filepath: string): AnyObject {
  if (!path.isAbsolute(filepath)) {
    throw new Error(`'${filepath}' is not an absolute filepath`);
  }
  const fileData = fs.readFileSync(filepath, { encoding: 'utf8' });
  try {
    return yaml.load(fileData) as AnyObject;
  } catch (error) {
    throw new Error(`Invalid YAML or JSON:\n${(error as Error).message}`);
  }
}

function validateSpec(obj: AnyObject): OpenAPI.Document {
  try {
    const validator = new OpenAPISchemaValidator({
      version:
        (obj as unknown as OpenAPIV2.Document).swagger || // '2.0'
        (obj as unknown as OpenAPIV3.Document).openapi, // '3.X.X'
    });
    const { errors } = validator.validate(obj as OpenAPI.Document);
    if (errors.length > 0) {
      throw new Error(stringify(errors));
    }
    return obj as OpenAPI.Document;
  } catch (error) {
    throw new Error(`Invalid OpenAPI spec: ${(error as Error).message}`);
  }
}
