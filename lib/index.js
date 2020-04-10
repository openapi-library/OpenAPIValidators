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

const { stringify } = require('./utils');
const openApiSpecFactory = require('./openApiSpecFactory');
const responseFactory = require('./responseFactory');
const ValidationError = require('./classes/errors/ValidationError');

module.exports = function (filepathOrObject) {
  const openApiSpec = openApiSpecFactory.makeApiSpec(filepathOrObject);

  return function (chai) {
    const { Assertion } = chai;

    Assertion.addProperty('satisfyApiSpec', function () {
      const actualResponse = responseFactory.makeResponse(this._obj);
      const actualRequest = actualResponse.req;

      const validationError = openApiSpec.validateResponse(actualResponse);
      const pass = !validationError;
      if (pass) {
        this.assert(
          pass,
          '',
          `expected res not to satisfy API spec for '${actualResponse.status}' response`
            + ` defined for endpoint '${actualRequest.method} ${openApiSpec.findOpenApiPathMatchingRequest(actualRequest)}'`
            + ` in OpenAPI spec\nres: ${actualResponse.toString()}`,
        );
      }

      if (
        validationError instanceof ValidationError
        && (validationError.code === 'PATH_NOT_FOUND' || validationError.code === 'SERVER_NOT_FOUND')
      ) {
        this.assert(
          pass,
          validationError.message,
          validationError.message,
        );
      }

      if (
        validationError instanceof ValidationError
        && (validationError.code === 'METHOD_NOT_FOUND' || validationError.code === 'STATUS_NOT_FOUND')
      ) {
        this.assert(
          pass,
          `expected res to satisfy API spec:\n${stringify(validationError)}`,
          `expected res not to satisfy API spec for '${actualResponse.status}' response`
            + ` defined for endpoint '${actualRequest.method} ${openApiSpec.findOpenApiPathMatchingRequest(actualRequest)}'`
            + ` in OpenAPI spec\nres: ${actualResponse.toString()}`,
        );
      }

      if (validationError instanceof ValidationError && validationError.code === 'INVALID_BODY') {
        validationError.errors.actualResponse = actualResponse.summary();
        this.assert(
          pass,
          `expected res to satisfy API spec:\n${stringify(validationError.errors)}`,
          `expected res not to satisfy API spec for '${actualResponse.status}' response`
            + ` defined for endpoint '${actualRequest.method} ${openApiSpec.findOpenApiPathMatchingRequest(actualRequest)}'`
            + ` in OpenAPI spec\nres: ${actualResponse.toString()}`,
        );
      }
    });

    Assertion.addMethod('satisfySchemaInApiSpec', function (schemaName) {
      const actualObject = this._obj;

      const validationError = openApiSpec.validateObject(actualObject, schemaName);
      const pass = !validationError;
      if (pass) {
        this.assert(
          pass,
          `expected object to satisfy schema '${schemaName}' defined in API spec`,
          `expected object not to satisfy schema '${schemaName}' defined in OpenAPI spec`
            + `\nobject: ${stringify(actualObject)}`,
        );
      }

      if (validationError instanceof ValidationError && validationError.code === 'SCHEMA_NOT_FOUND') {
        this.assert(
          this.__flags.negate, // always throw this AssertionError, to alert users they are misusing this assertion
          'The argument to satisfySchemaInApiSpec must match a schema in your API spec',
          'The argument to satisfySchemaInApiSpec must match a schema in your API spec',
        );
      }

      if (validationError instanceof ValidationError && validationError.code === 'INVALID_BODY') {
        validationError.errors.actualObject = actualObject;
        this.assert(
          pass,
          `expected object to satisfy schema '${schemaName}' defined in API spec:`
            + `\n${stringify(validationError.errors)}`,
          `expected object not to satisfy schema '${schemaName}' defined in OpenAPI spec`
            + `\nobject: ${stringify(actualObject)}`,
        );
      }
    });
  };
};
