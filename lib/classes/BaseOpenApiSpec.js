const url = require('url');
const PathParser = require('path-parser').default;
const OpenAPIResponseValidator = require('openapi-response-validator').default;

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
    if (expectedResponse && expectedResponse['$ref']) {
      expectedResponse = this.findResponseDefinition(expectedResponse['$ref']);
    }
    if (!expectedResponse) {
      throw new Error(`No '${status}' response defined for endpoint '${actualRequest.method} ${this.findOpenApiPathMatchingRequest(actualRequest)}' in OpenAPI spec`);
    }

    return { [status]: expectedResponse };
  }

  findOpenApiPathMatchingRequest(actualRequest) {
    const actualPathname = this.extractCleanPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    return openApiPath;
  }

  extractCleanPathname(actualRequest) {
    const { pathname } = url.parse(actualRequest.path); // excludes the query (because: path = pathname + query)
    return this.cleanPathname(pathname);
  }

  findOpenApiPathMatchingPathname(pathname) {
    const openApiPath = this.paths().find(openApiPath => {
      const pathInColonForm = openApiPath.replace(/{/g, ':').replace(/}/g, ''); // converts all {foo} to :foo
      const pathParser = new PathParser(pathInColonForm);
      const pathParamsInPathname = pathParser.test(pathname); // => one of: null, {}, {exampleParam: 'foo'}
      return !!pathParamsInPathname;
    });
    return openApiPath;
  }

  /**
   * @returns {OperationObject} OperationObject
   * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operation-object}
   * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject}
   */
  findExpectedResponseOperation(actualRequest) {
    const actualPathname = this.extractCleanPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    if (!openApiPath) {
      throw new Error(`No '${actualPathname}' path defined in OpenAPI spec`);
    }
    const pathItemObject = this.getPathItem(openApiPath);
    const operationObject = pathItemObject[actualRequest.method.toLowerCase()];
    if (!operationObject) {
      throw new Error(`No '${actualRequest.method}' method defined for path '${openApiPath}' in OpenAPI spec`);
    }
    return operationObject;
  }

  validateResponse(actualResponse, expectedResponse) {
    const resValidator = new OpenAPIResponseValidator({
      responses: expectedResponse,
      ...this.getVersionSpecificValidatorOptions(),
    });

    const [expectedResStatus] = Object.keys(expectedResponse);
    const validationError = resValidator.validateResponse(expectedResStatus, actualResponse.body());
    return validationError;
  }
}

module.exports = OpenApiSpec;
