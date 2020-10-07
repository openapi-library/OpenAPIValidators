import OpenAPIResponseValidator, {
  OpenAPIResponseValidatorArgs,
} from 'openapi-response-validator';
import { extractPathname } from '../utils';
import type * as OpenAPI from './AbstractOpenApiSpec.types';
import ValidationError from './errors/ValidationError';

export default abstract class OpenApiSpec {
  protected readonly spec: OpenAPI.Document;

  abstract findResponseDefinition(ref: string): OpenAPI.ResponseObject;

  constructor(spec: OpenAPI.Document) {
    this.spec = spec;
  }

  pathsObject(): OpenAPI.PathsObject {
    return this.spec.paths;
  }

  getPathItem(openApiPath): OpenAPI.PathItemObject {
    return this.pathsObject()[openApiPath];
  }

  paths(): string[] {
    return Object.keys(this.pathsObject());
  }

  abstract getSchemaObjects(): OpenAPI.SchemasObject;

  getSchemaObject(schemaName: string): OpenAPI.SchemaObject {
    return this.getSchemaObjects()[schemaName];
  }

  findExpectedResponse(actualResponse): OpenAPI.ResponsesObject {
    const actualRequest = actualResponse.req;
    const expectedResponseOperation = this.findExpectedResponseOperation(
      actualRequest,
    );
    if (!expectedResponseOperation) {
      throw new ValidationError('METHOD_NOT_FOUND');
    }

    const { status } = actualResponse;
    let expectedResponse = expectedResponseOperation.responses[status];
    if (expectedResponse && expectedResponse.$ref) {
      expectedResponse = this.findResponseDefinition(expectedResponse.$ref);
    }
    if (!expectedResponse) {
      throw new ValidationError('STATUS_NOT_FOUND');
    }

    return { [status]: expectedResponse };
  }

  abstract findOpenApiPathMatchingPathname(pathname: string): string;

  findOpenApiPathMatchingRequest(actualRequest: Request): string {
    const actualPathname = extractPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    return openApiPath;
  }

  findExpectedPathItem(actualRequest: Request): OpenAPI.PathItemObject {
    const actualPathname = extractPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    const pathItemObject = this.getPathItem(openApiPath);
    return pathItemObject;
  }

  findExpectedResponseOperation(
    actualRequest: Request,
  ): OpenAPI.OperationObject {
    const pathItemObject = this.findExpectedPathItem(actualRequest);
    const operationObject = pathItemObject[actualRequest.method.toLowerCase()];
    return operationObject;
  }

  abstract getComponentDefinitionsProperty(): OpenAPI.ComponentDefinitionsProperty;

  validateResponse(actualResponse): ValidationError {
    let expectedResponse;
    try {
      expectedResponse = this.findExpectedResponse(actualResponse);
    } catch (error) {
      if (error instanceof ValidationError) {
        return error;
      }
      throw error;
    }
    const resValidator = new OpenAPIResponseValidator({
      responses: expectedResponse,
      ...this.getComponentDefinitionsProperty(),
    } as OpenAPIResponseValidatorArgs);

    const [expectedResStatus] = Object.keys(expectedResponse);
    const validationError = resValidator.validateResponse(
      expectedResStatus,
      actualResponse.getBodyForValidation(),
    );
    if (validationError) {
      return new ValidationError(
        'INVALID_BODY',
        validationError.errors.map((error) => error.message).join(', '),
      );
    }
    return null;
  }

  /*
   * For consistency and to save maintaining another dependency,
   * we validate objects using our response validator:
   * We put the object inside a mock response, then validate
   * the whole response against a mock expected response.
   * The 2 mock responses are identical except for the body,
   * thus validating the object against its schema.
   */
  validateObject(actualObject, schema: OpenAPI.SchemaObject): ValidationError {
    const mockResStatus = 200;
    const mockExpectedResponse = { [mockResStatus]: { schema } };
    const resValidator = new OpenAPIResponseValidator({
      responses: mockExpectedResponse,
      ...this.getComponentDefinitionsProperty(),
      errorTransformer: (error) => ({
        message: error.message.replace('response', 'object'),
      }),
    } as any);
    // } as OpenAPIResponseValidatorArgs);
    const validationError = resValidator.validateResponse(
      mockResStatus,
      actualObject,
    );
    if (validationError) {
      return new ValidationError(
        'INVALID_OBJECT',
        validationError.errors.map((error) => error.message).join(', '),
      );
    }
    return null;
  }
}
