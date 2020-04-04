const OpenAPIResponseValidator = require('openapi-response-validator').default;

const { extractPathname } = require('../utils');

const toOpenapiModelValidationError = (error) => ({
  errorCode: 'type.openapi.objectValidation',
  message: error.message.replace('response', 'object'),
});

class OpenApiSpec {
  constructor(spec) {
    this.spec = spec;
  }

  /**
   * @returns {[PathItemObject]} [PathItemObject]
   * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#path-item-object}
   * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject}
   */
  pathsObject() {
    return this.spec.paths;
  }

  getPathItem(openApiPath) {
    return this.pathsObject()[openApiPath];
  }

  paths() {
    return Object.keys(this.pathsObject());
  }

  getSchemaObject(schemaName) {
    const schemaObjects = this.getSchemaObjects();
    return schemaObjects[schemaName];
  }

  /**
   * @returns {ResponseObject} ResponseObject
   * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#response-object}
   * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#responseObject}
   */
  findExpectedResponse(actualResponse) {
    const actualRequest = actualResponse.req();
    const expectedResponseOperation = this.findExpectedResponseOperation(actualRequest);

    const status = actualResponse.status();
    let expectedResponse = expectedResponseOperation.responses[status];
    if (expectedResponse && expectedResponse.$ref) {
      expectedResponse = this.findResponseDefinition(expectedResponse.$ref);
    }
    if (!expectedResponse) {
      throw new Error(`No '${status}' response defined for endpoint '${actualRequest.method} ${this.findOpenApiPathMatchingRequest(actualRequest)}' in OpenAPI spec`);
    }

    return { [status]: expectedResponse };
  }

  findOpenApiPathMatchingRequest(actualRequest) {
    const actualPathname = extractPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    return openApiPath;
  }

  /**
   * @returns {OperationObject} OperationObject
   * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operation-object}
   * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject}
   */
  findExpectedResponseOperation(actualRequest) {
    const actualPathname = extractPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    const pathItemObject = this.getPathItem(openApiPath);
    const operationObject = pathItemObject[actualRequest.method.toLowerCase()];
    if (!operationObject) {
      throw new Error(`No '${actualRequest.method}' method defined for path '${openApiPath}' in OpenAPI spec`);
    }
    return operationObject;
  }

  validateResponse(actualResponse) {
    const expectedResponse = this.findExpectedResponse(actualResponse);
    const resValidator = new OpenAPIResponseValidator({
      responses: expectedResponse,
      ...this.getComponentDefinitionsProperty(),
    });

    const [expectedResStatus] = Object.keys(expectedResponse);
    const validationError = resValidator.validateResponse(
      expectedResStatus,
      actualResponse.getBodyForValidation(),
    );
    if (validationError) {
      validationError.actualResponse = actualResponse.summary();
    }
    return validationError;
  }

  validateObject(actualObject, schemaName) {
    const schema = this.getSchemaObject(schemaName);
    if (!schema) {
      throw new Error(`No schema named '${schemaName}' in OpenAPI spec`);
    }

    /*
     * For consistency and to save maintaining another dependency,
     * we validate objects using our response validator:
     * We put the object inside a mock response, then validate
     * the whole response against a mock expected response.
     * The 2 mock responses are identical except for the body,
     * thus validating the object against its schema.
     */
    const mockResStatus = 200;
    const mockExpectedResponse = { [mockResStatus]: { schema } };
    const resValidator = new OpenAPIResponseValidator({
      responses: mockExpectedResponse,
      ...this.getComponentDefinitionsProperty(),
      errorTransformer: toOpenapiModelValidationError,
    });
    const validationError = resValidator.validateResponse(
      mockResStatus,
      actualObject,
    );
    if (validationError) {
      validationError.message = validationError.message.replace('response', 'object');
      validationError.actualObject = actualObject;
    }
    return validationError;
  }
}

module.exports = OpenApiSpec;
