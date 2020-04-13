const OpenAPIResponseValidator = require('openapi-response-validator').default;

const { extractPathname } = require('../utils');
const ValidationError = require('./errors/ValidationError');

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
    const actualRequest = actualResponse.req;
    const expectedResponseOperation = this.findExpectedResponseOperation(actualRequest);
    if (!expectedResponseOperation) {
      throw new ValidationError('METHOD_NOT_FOUND');
    }

    const status = actualResponse.status;
    let expectedResponse = expectedResponseOperation.responses[status];
    if (expectedResponse && expectedResponse.$ref) {
      expectedResponse = this.findResponseDefinition(expectedResponse.$ref);
    }
    if (!expectedResponse) {
      throw new ValidationError('STATUS_NOT_FOUND');
    }

    return { [status]: expectedResponse };
  }

  findOpenApiPathMatchingRequest(actualRequest) {
    const actualPathname = extractPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    return openApiPath;
  }

  /**
   * @returns {PathItemObject} PathItemObject
   * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#path-item-object}
   * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject}
   */
  findExpectedPathItem(actualRequest) {
    const actualPathname = extractPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    const pathItemObject = this.getPathItem(openApiPath);
    return pathItemObject;
  }

  /**
   * @returns {OperationObject} OperationObject
   * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operation-object}
   * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject}
   */
  findExpectedResponseOperation(actualRequest) {
    const pathItemObject = this.findExpectedPathItem(actualRequest);
    const operationObject = pathItemObject[actualRequest.method.toLowerCase()];
    return operationObject;
  }

  validateResponse(actualResponse) {
    let expectedResponse;
    try {
      expectedResponse = this.findExpectedResponse(actualResponse);
    } catch (error) {
      /* istanbul ignore next */
      if (error instanceof ValidationError) {
        return error;
      }
      /* istanbul ignore next */
      throw error;
    }
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
      return new ValidationError(
        'INVALID_BODY',
        validationError.errors.map(error => error.message).join(', '),
      );
    }
  }

  /*
   * For consistency and to save maintaining another dependency,
   * we validate objects using our response validator:
   * We put the object inside a mock response, then validate
   * the whole response against a mock expected response.
   * The 2 mock responses are identical except for the body,
   * thus validating the object against its schema.
   */
  validateObject(actualObject, schema) {
    const mockResStatus = 200;
    const mockExpectedResponse = { [mockResStatus]: { schema } };
    const resValidator = new OpenAPIResponseValidator({
      responses: mockExpectedResponse,
      ...this.getComponentDefinitionsProperty(),
      errorTransformer: (error) => ({
        message: error.message.replace('response', 'object'),
      }),
    });
    const validationError = resValidator.validateResponse(
      mockResStatus,
      actualObject,
    );
    if (validationError) {
      return new ValidationError(
        'INVALID_OBJECT',
        validationError.errors.map(error => error.message).join(', '),
      );
    }
  }
}

module.exports = OpenApiSpec;
