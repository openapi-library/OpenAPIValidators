import type { OpenAPI } from 'openapi-types';
import type OpenApi2Spec from './classes/OpenApi2Spec';
import type OpenApi3Spec from './classes/OpenApi3Spec';

export type { Schema } from './classes/AbstractOpenApiSpec';
export type {
  ActualRequest,
  ActualResponse,
  RawResponse,
} from './classes/AbstractResponse';
export {
  default as ValidationError,
  ErrorCode,
} from './classes/errors/ValidationError';
export type { default as OpenApi2Spec } from './classes/OpenApi2Spec';
export type { default as OpenApi3Spec } from './classes/OpenApi3Spec';
export { default as makeApiSpec } from './openApiSpecFactory';
export { default as makeResponse } from './responseFactory';

export type OpenApiSpec = OpenApi2Spec | OpenApi3Spec;
export type OpenAPISpecObject = OpenAPI.Document;
