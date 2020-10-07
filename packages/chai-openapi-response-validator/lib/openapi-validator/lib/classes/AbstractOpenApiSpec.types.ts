import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import type { OpenAPIV2DefinitionsProperty } from './OpenApi2Spec';
import type {
  OpenAPIV3SchemasObject,
  OpenAPIV3ComponentsProperty,
} from './OpenApi3Spec';

export type Document = OpenAPI.Document;

/**
 * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object}
 * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathsObject}
 */
export type PathsObject = OpenAPIV2.PathsObject | OpenAPIV3.PathsObject;

/**
 * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#path-item-object}
 * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject}
 */
export type PathItemObject =
  | OpenAPIV2.PathItemObject
  | OpenAPIV3.PathItemObject;

/**
 * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operation-object}
 * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject}
 */
export type OperationObject = OpenAPI.Operation;

export type ResponsesObject = {
  [code: string]: ResponseObject;
};

/**
 * @see OpenAPI2 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#response-object}
 * @see OpenAPI3 {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#responseObject}
 */
export type ResponseObject =
  | OpenAPIV2.ResponseObject
  | OpenAPIV3.ResponseObject;

export type SchemaObject = OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject;

export type ComponentDefinitionsProperty =
  | OpenAPIV2DefinitionsProperty
  | OpenAPIV3ComponentsProperty;

export type SchemasObject =
  | OpenAPIV2.DefinitionsObject
  | OpenAPIV3SchemasObject;

export type OpenAPIPath = string;
