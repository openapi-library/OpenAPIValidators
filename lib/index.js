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

module.exports = function (filepathOrObject) {
  const openApiSpec = openApiSpecFactory.makeApiSpec(filepathOrObject);

  return function (chai) {
    const { Assertion } = chai;

    Assertion.addProperty('satisfyApiSpec', function () {
      const actualResponse = new Response(this._obj);
      const actualRequest = actualResponse.req();

      const expectedResponse = openApiSpec.findExpectedResponse(actualResponse);

      const validationError = openApiSpec.validateResponse(actualResponse, expectedResponse);
      if (validationError) {
        validationError.actualResponse = actualResponse.summary();
      }

      this.assert(
        !validationError,
        `expected res to satisfy API spec:\n${stringify(validationError)}`,
        `expected res not to satisfy API spec for '${actualResponse.status()}' response`
        + ` defined for endpoint '${actualRequest.method} ${openApiSpec.findOpenApiPathMatchingRequest(actualRequest)}'`
        + ` in OpenAPI spec\nres: ${actualResponse.toString()}`,
      );
    });

    Assertion.addMethod('satisfySchemaInApiSpec', function (schemaName) {
      const actualObject = this._obj;

      const validationError = openApiSpec.validateObject(actualObject, schemaName);

      this.assert(
        !validationError,
        `expected object to satisfy schema '${schemaName}' defined in API spec:\n${stringify(validationError)}`,
        `expected object not to satisfy schema '${schemaName}'`
          + ` defined in OpenAPI spec\nobject: ${stringify(actualObject)}`
      );
    });
  };
};
