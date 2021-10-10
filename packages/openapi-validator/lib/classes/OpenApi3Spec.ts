import type { OpenAPIV3 } from 'openapi-types';
import type { ResponseObjectWithSchema } from './AbstractOpenApiSpec';
import {
  defaultBasePath,
  findOpenApiPathMatchingPossiblePathnames,
  getPathnameWithoutBasePath,
} from '../utils/common.utils';
import {
  serversPropertyNotProvidedOrIsEmptyArray,
  getMatchingServerUrlsAndServerBasePaths,
} from '../utils/OpenApi3Spec.utils';
import AbstractOpenApiSpec from './AbstractOpenApiSpec';
import ValidationError, { ErrorCode } from './errors/ValidationError';

export default class OpenApi3Spec extends AbstractOpenApiSpec {
  public didUserDefineServers: boolean;

  constructor(protected override spec: OpenAPIV3.Document) {
    super(spec);
    this.didUserDefineServers = !serversPropertyNotProvidedOrIsEmptyArray(spec);
    this.ensureDefaultServer();
  }

  /**
   * "If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of '/'"
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#fixed-fields
   */
  ensureDefaultServer(): void {
    if (serversPropertyNotProvidedOrIsEmptyArray(this.spec)) {
      this.spec.servers = [{ url: defaultBasePath }];
    }
  }

  servers(): OpenAPIV3.ServerObject[] {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.spec.servers!;
  }

  getServerUrls(): string[] {
    return this.servers().map((server) => server.url);
  }

  getMatchingServerUrls(pathname: string): string[] {
    return getMatchingServerUrlsAndServerBasePaths(
      this.servers(),
      pathname,
    ).map(({ concreteUrl }) => concreteUrl);
  }

  getMatchingServerBasePaths(pathname: string): string[] {
    return getMatchingServerUrlsAndServerBasePaths(
      this.servers(),
      pathname,
    ).map(({ matchingBasePath }) => matchingBasePath);
  }

  findOpenApiPathMatchingPathname(pathname: string): string {
    const matchingServerBasePaths = this.getMatchingServerBasePaths(pathname);
    if (!matchingServerBasePaths.length) {
      throw new ValidationError(ErrorCode.ServerNotFound);
    }
    const possiblePathnames = matchingServerBasePaths.map((basePath) =>
      getPathnameWithoutBasePath(basePath, pathname),
    );
    const openApiPath = findOpenApiPathMatchingPossiblePathnames(
      possiblePathnames,
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const nameOfResponseDefinition = referenceString.split(
      '#/components/responses/',
    )[1]!;
    return this.spec.components?.responses?.[nameOfResponseDefinition] as
      | ResponseObjectWithSchema
      | undefined;
  }

  getComponentDefinitionsProperty(): Pick<OpenAPIV3.Document, 'components'> {
    return { components: this.spec.components };
  }

  getSchemaObjects(): OpenAPIV3.ComponentsObject['schemas'] {
    return this.spec.components?.schemas;
  }
}
