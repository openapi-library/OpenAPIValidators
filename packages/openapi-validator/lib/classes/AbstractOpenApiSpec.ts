import OpenAPIResponseValidator from 'openapi-response-validator';
import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { getPathname } from '../utils/common.utils';
import type { ActualRequest, ActualResponse } from './AbstractResponse';
import ValidationError, { ErrorCode } from './errors/ValidationError';

type Document = OpenAPIV2.Document | OpenAPIV3.Document;

type Operation = OpenAPIV2.OperationObject | OpenAPIV3.OperationObject;

type HttpMethods = OpenAPIV2.HttpMethods;

type PathItemObject = OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject;

export type ResponseObjectWithSchema =
  | (OpenAPIV2.ResponseObject & { schema: OpenAPIV2.Schema })
  | (OpenAPIV3.ResponseObject & {
      content: {
        [media: string]: OpenAPIV3.MediaTypeObject & {
          schema: OpenAPIV3.SchemaObject;
        };
      };
    })
  | (OpenAPIV3_1.ResponseObject & {
      content: {
        [media: string]: OpenAPIV3_1.MediaTypeObject & {
          schema: OpenAPIV3_1.SchemaObject;
        };
      };
    });

export type Schema = OpenAPIV2.Schema | OpenAPIV3.SchemaObject;

export default abstract class OpenApiSpec {
  protected abstract getSchemaObjects(): Record<string, Schema> | undefined;

  protected abstract findResponseDefinition(
    referenceString: string,
  ): ResponseObjectWithSchema | undefined;

  protected abstract findOpenApiPathMatchingPathname(pathname: string): string;

  protected abstract getComponentDefinitionsProperty():
    | {
        definitions: OpenAPIV2.Document['definitions'];
      }
    | {
        components: OpenAPIV3.Document['components'];
      };

  constructor(protected spec: Document) {}

  pathsObject(): Document['paths'] {
    return this.spec.paths;
  }

  getPathItem(openApiPath: string): PathItemObject {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.pathsObject()[openApiPath]!;
  }

  paths(): string[] {
    return Object.keys(this.pathsObject());
  }

  getSchemaObject(schemaName: string): Schema | undefined {
    return this.getSchemaObjects()?.[schemaName];
  }

  getExpectedResponse(
    responseOperation: Operation,
    status: ActualResponse['status'],
  ): ResponseObjectWithSchema | undefined {
    const response =
      responseOperation.responses[status] ||
      responseOperation.responses.default;
    if (!response) {
      return undefined;
    }
    if ('$ref' in response) {
      return this.findResponseDefinition(response.$ref);
    }
    return response as ResponseObjectWithSchema;
  }

  findExpectedResponse(
    actualResponse: ActualResponse,
  ): Record<string, ResponseObjectWithSchema> {
    const actualRequest = actualResponse.req;
    const expectedResponseOperation =
      this.findExpectedResponseOperation(actualRequest);
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

  findExpectedResponseOperation(
    actualRequest: ActualRequest,
  ): Operation | undefined {
    const pathItemObject = this.findExpectedPathItem(actualRequest);
    const operationObject =
      pathItemObject[actualRequest.method.toLowerCase() as HttpMethods];
    return operationObject;
  }

  validateResponse(actualResponse: ActualResponse): ValidationError | null {
    let expectedResponse: Record<string, ResponseObjectWithSchema>;
    try {
      expectedResponse = this.findExpectedResponse(actualResponse);
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const expectedResStatus = Object.keys(expectedResponse)[0]!;
    const validationError = validator.validateResponse(
      expectedResStatus,
      actualResponse.getBodyForValidation(),
    );
    return validationError
      ? new ValidationError(
          ErrorCode.InvalidBody,
          validationError.errors
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
    const mockResStatus = '200';
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
          validationError.errors.map((error) => error.message).join(', '),
        )
      : null;
  }
}
