/*******************************************************************************
 * Copyright 2019 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

const util = require('util');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const OpenAPIResponseValidator = require('openapi-response-validator').default;

module.exports = function(pathToOpenApiSpec) {
  const openApiSpec = parseOpenApiFile(pathToOpenApiSpec);

  return function (chai) {
    const Assertion = chai.Assertion;

    Assertion.addProperty('satisfyApiSpec', function () {
      const res = this._obj;
      const expectedResStatus = res.status;
      checkApiSpecDefinesExpectedResponse(res, expectedResStatus, openApiSpec);

      const validationError = validateResAgainstApiSpec(res, expectedResStatus, openApiSpec);

      const responseSummary = util.inspect({ status: res.status, body: res.body });
      this.assert(
        !validationError,
        `expected res to satisfy API spec:\n${util.inspect(validationError)}`,
        `expected res not to satisfy API spec for '${expectedResStatus}' response defined for endpoint '${res.req.method} ${res.req.path}' in OpenAPI spec\nres: ${responseSummary}`,
      );
    });
  };
};

function parseOpenApiFile(filePath) {
  if (!path.isAbsolute(filePath)) {
    throw new Error('The "path" argument must be an absolute path');
  }
  const fileData = fs.readFileSync(filePath);
  let openApiSpec;
  try {
    openApiSpec = yaml.safeLoad(fileData);
  } catch (error) {
    throw new Error(`Error: Unable to read the specified OpenAPI document. File is invalid YAML or JSON:\n${error.message}`);
  }

  try {
    const openApiVersion = openApiSpec.swagger || openApiSpec.openapi;
    const validator = new OpenAPISchemaValidator({ version: openApiVersion });
    const { errors } = validator.validate(openApiSpec);
    if (errors.length > 0) throw new Error(util.inspect(errors));
  } catch (error) {
    throw new Error(`Error: File is not a valid OpenAPI spec.\nError(s): ${error.message}`);
  }

  return openApiSpec;
}

function checkApiSpecDefinesExpectedResponse(res, expectedResStatus, openApiSpec) {
  const path = res.req.path;
  const routeObj = openApiSpec.paths[path];
  if (!routeObj) {
    throw new Error(`No '${path}' route defined in OpenAPI spec`);
  }

  const httpMethod = res.req.method;
  const endpointObj = routeObj[httpMethod.toLowerCase()];
  if (!endpointObj) {
    throw new Error(`No '${res.req.method}' method defined for route '${path}' in OpenAPI spec`);
  }

  const expectedResponse = endpointObj.responses[expectedResStatus];
  if (!expectedResponse) {
    throw new Error(`No '${expectedResStatus}' response defined for endpoint '${httpMethod} ${path}' in OpenAPI spec`);
  }
}

function validateResAgainstApiSpec(res, expectedResStatus, openApiSpec) {
  const instance = new OpenAPIResponseValidator({
    responses: extractExpectedResponsesFromApiSpec(res, openApiSpec),
    components: openApiSpec.components, // needed if openApiSpec is OpenAPI 3
    definitions: openApiSpec.definitions, // needed if openApiSpec is OpenAPI 2
  });
  const validationError = instance.validateResponse(expectedResStatus, res.body);
  if (validationError) {
    validationError.actualResponse = { status: res.status, body: res.body };
  }
  return validationError;
}

function extractExpectedResponsesFromApiSpec(res, openApiSpec) {
  const { path, method } = res.req;
  return openApiSpec.paths[path][method.toLowerCase()].responses;
}
