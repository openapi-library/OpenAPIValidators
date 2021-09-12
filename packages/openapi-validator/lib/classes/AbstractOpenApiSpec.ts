import OpenAPIResponseValidator from 'openapi-response-validator';
import type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { getPathname } from '../utils/common.utils';
import type { ActualRequest, ActualResponse } from './AbstractResponse';
import ValidationError, { ErrorCode } from './errors/ValidationError';

type Document = OpenAPI.Document;

type Operation = OpenAPI.Operation;

type HttpMethods = OpenAPIV2.HttpMethods;

type PathsObject =
  | OpenAPIV2.PathsObject
  | OpenAPIV3.PathsObject
  | OpenAPIV3_1.PathsObject;

type PathItemObject =
  | OpenAPIV2.PathItemObject
  | OpenAPIV3.PathItemObject
  | OpenAPIV3_1.PathItemObject;

export type ResponseObject =
  | OpenAPIV2.ResponseObject
  | OpenAPIV3.ResponseObject
  | OpenAPIV3_1.ResponseObject;

export type Schema = OpenAPIV2.Schema | OpenAPIV3.SchemaObject;

export default abstract class OpenApiSpec {
  protected abstract getSchemaObjects(): Record<string, Schema>;

  protected abstract findResponseDefinition(
    referenceString: string,
  ): ResponseObject;

  protected abstract findOpenApiPathMatchingPathname(pathname: string): string;

  protected abstract getComponentDefinitionsProperty():
    | Pick<OpenAPIV2.Document, 'definitions'>
    | Pick<OpenAPIV3.Document, 'components'>;

  constructor(protected spec: Document) {}

  pathsObject(): PathsObject | undefined {
    return this.spec.paths;
  }

  getPathItem(openApiPath: string): PathItemObject | undefined {
    return this.pathsObject()[openApiPath];
  }

  paths(): string[] {
    return Object.keys(this.pathsObject());
  }

  getSchemaObject(schemaName: string): Schema {
    const schemaObjects = this.getSchemaObjects();
    return schemaObjects[schemaName];
  }

  getExpectedResponse(
    responseOperation: Operation,
    status: ActualResponse['status'],
  ): ResponseObject | undefined {
    const response = responseOperation.responses[status];
    if (!response) {
      return undefined;
    }
    if ('$ref' in response) {
      return this.findResponseDefinition(response.$ref);
    }
    return response;
  }

  findExpectedResponse(
    actualResponse: ActualResponse,
  ): Record<string, ResponseObject> {
    const actualRequest = actualResponse.req;
    const expectedResponseOperation = this.findExpectedResponseOperation(
      actualRequest,
    );
    if (!expectedResponseOperation) {
      throw new ValidationError(ErrorCode.MethodNotFound);
    }

    const { status } = actualResponse;
    const expectedResponse = this.getExpectedResponse(
      expectedResponseOperation,
      status,
    );
    if (!expectedResponse) {
      throw new ValidationError(ErrorCode.StatusNotFound);
    }

    return { [status]: expectedResponse };
  }

  findOpenApiPathMatchingRequest(actualRequest: ActualRequest): string {
    const actualPathname = getPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    return openApiPath;
  }

  findExpectedPathItem(actualRequest: ActualRequest): PathItemObject {
    const actualPathname = getPathname(actualRequest);
    const openApiPath = this.findOpenApiPathMatchingPathname(actualPathname);
    const pathItemObject = this.getPathItem(openApiPath);
    return pathItemObject;
  }

  findExpectedResponseOperation(actualRequest: ActualRequest): Operation {
    const pathItemObject = this.findExpectedPathItem(actualRequest);
    const operationObject =
      pathItemObject[actualRequest.method.toLowerCase() as HttpMethods];
    return operationObject;
  }

  validateResponse(actualResponse: ActualResponse): ValidationError | null {
    type ResponseWithSchema = Record<string, { schema: Schema }>;
    let expectedResponse: ResponseWithSchema;
    try {
      expectedResponse = this.findExpectedResponse(
        actualResponse,
      ) as ResponseWithSchema;
    } catch (error) {
      if (error instanceof ValidationError) {
        return error;
      }
      throw error;
    }
    const validator = new OpenAPIResponseValidator({
      responses: expectedResponse,
      ...this.getComponentDefinitionsProperty(),
    });

    const [expectedResStatus] = Object.keys(expectedResponse);
    const validationError = validator.validateResponse(
      expectedResStatus,
      actualResponse.getBodyForValidation(),
    );
    return validationError
      ? new ValidationError(
          ErrorCode.InvalidBody,
          (validationError.errors as { path: string; message: string }[])
            .map(({ path, message }) => `${path} ${message}`)
            .join(', '),
        )
      : null;
  }

  /*
   * For consistency and to save maintaining another dependency,
   * we validate objects using our response validator:
   * We put the object inside a mock response, then validate
   * the whole response against a mock expected response.
   * The 2 mock responses are identical except for the body,
   * thus validating the object against its schema.
   */
  validateObject(
    actualObject: unknown,
    schema: Schema,
  ): ValidationError | null {
    const mockResStatus = 200;
    const mockExpectedResponse = { [mockResStatus]: { schema } };
    const validator = new OpenAPIResponseValidator({
      responses: mockExpectedResponse,
      ...this.getComponentDefinitionsProperty(),
      errorTransformer: ({ path, message }) => ({
        message: `${path.replace('response', 'object')} ${message}`,
      }),
    });
    const validationError = validator.validateResponse(
      mockResStatus,
      actualObject,
    );
    return validationError
      ? new ValidationError(
          ErrorCode.InvalidObject,
          (validationError.errors as { message: string }[])
            .map((error) => error.message)
            .join(', '),
        )
      : null;
  }
}
