import type { OpenAPIV2 } from 'openapi-types';
import type { ResponseObjectWithSchema } from './AbstractOpenApiSpec';
import {
  getPathnameWithoutBasePath,
  findOpenApiPathMatchingPossiblePathnames,
} from '../utils/common.utils';
import AbstractOpenApiSpec from './AbstractOpenApiSpec';
import ValidationError, { ErrorCode } from './errors/ValidationError';

const basePathPropertyNotProvided = (spec: OpenAPIV2.Document): boolean =>
  !spec.basePath;

export default class OpenApi2Spec extends AbstractOpenApiSpec {
  public didUserDefineBasePath: boolean;

  constructor(public spec: OpenAPIV2.Document) {
    super(spec);
    this.didUserDefineBasePath = !basePathPropertyNotProvided(spec);
  }

  /**
   * "If the basePath property is not provided, the API is served directly under the host
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#fixed-fields
   */
  findOpenApiPathMatchingPathname(pathname: string): string {
    const { basePath } = this.spec;
    if (basePath && !pathname.startsWith(basePath)) {
      throw new ValidationError(ErrorCode.BasePathNotFound);
    }
    const pathnameWithoutBasePath = basePath
      ? getPathnameWithoutBasePath(basePath, pathname)
      : pathname;
    const openApiPath = findOpenApiPathMatchingPossiblePathnames(
      [pathnameWithoutBasePath],
      this.paths(),
    );
    if (!openApiPath) {
      throw new ValidationError(ErrorCode.PathNotFound);
    }
    return openApiPath;
  }

  findResponseDefinition(
    referenceString: string,
  ): ResponseObjectWithSchema | undefined {
    const nameOfResponseDefinition = referenceString.split('#/responses/')[1];
    return this.spec.responses?.[nameOfResponseDefinition] as
      | ResponseObjectWithSchema
      | undefined;
  }

  getComponentDefinitionsProperty(): Pick<OpenAPIV2.Document, 'definitions'> {
    return { definitions: this.spec.definitions };
  }

  getSchemaObjects(): OpenAPIV2.Document['definitions'] {
    return this.spec.definitions;
  }
}
