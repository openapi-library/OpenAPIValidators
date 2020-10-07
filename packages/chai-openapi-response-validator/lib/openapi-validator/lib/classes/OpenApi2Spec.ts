import type { OpenAPIV2 } from 'openapi-types';
import { findOpenApiPathMatchingPossiblePathnames, Pathname } from '../utils';
import AbstractOpenApiSpec from './AbstractOpenApiSpec';
import type { OpenAPIPath } from './AbstractOpenApiSpec.types';
import ValidationError from './errors/ValidationError';

/**
 * @see {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#definitions-object}
 */
export type OpenAPIV2DefinitionsProperty = {
  definitions: OpenAPIV2.DefinitionsObject;
};
export default class OpenApi2Spec extends AbstractOpenApiSpec {
  protected spec: OpenAPIV2.Document;

  findOpenApiPathMatchingPathname(pathname: Pathname): OpenAPIPath {
    const openApiPath = findOpenApiPathMatchingPossiblePathnames(
      [pathname],
      this.paths(),
    );
    if (!openApiPath) {
      throw new ValidationError('PATH_NOT_FOUND');
    }
    return openApiPath;
  }

  findResponseDefinition($ref: string): OpenAPIV2.ResponseObject {
    const nameOfResponseDefinition = $ref.split('#/responses/')[1];
    return this.spec.responses[nameOfResponseDefinition];
  }

  getComponentDefinitions(): OpenAPIV2.DefinitionsObject {
    return this.spec.definitions;
  }

  getComponentDefinitionsProperty(): OpenAPIV2DefinitionsProperty {
    return { definitions: this.getComponentDefinitions() };
  }

  getSchemaObjects(): OpenAPIV2.DefinitionsObject {
    return this.getComponentDefinitions();
  }
}
