import type { OpenAPIPath } from './AbstractOpenApiSpec.types';
import type { OpenAPIV3 } from 'openapi-types';
import url from 'url';

import { Pathname, findOpenApiPathMatchingPossiblePathnames } from '../utils';
import AbstractOpenApiSpec from './AbstractOpenApiSpec';
import ValidationError from './errors/ValidationError';

export type OpenAPIV3SchemasObject = {
  [key: string]: OpenAPIV3.SchemaObject;
};

/**
 * @see {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsObject}
 */
export type OpenAPIV3ComponentsProperty = {
  components: OpenAPIV3.ComponentsObject;
};

const serversPropertyNotProvidedOrIsEmptyArray = (spec) =>
  !Object.prototype.hasOwnProperty.call(spec, 'servers') ||
  !spec.servers.length;

const extractBasePath = (inputUrl) => url.parse(inputUrl).path;

const getPathnameWithoutBasePath = (
  basePath: string,
  pathname: Pathname,
): Pathname => (basePath === '/' ? pathname : pathname.replace(basePath, ''));

export default class OpenApi3Spec extends AbstractOpenApiSpec {
  protected spec: OpenAPIV3.Document;
  public didUserDefineServers: boolean;

  constructor(spec: OpenAPIV3.Document) {
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
      this.spec.servers = [{ url: '/' }];
    }
  }

  /**
   * @see {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#server-object}
   */
  servers(): OpenAPIV3.ServerObject[] {
    return this.spec.servers;
  }

  getServerUrls(): string[] {
    return this.servers().map((server) => server.url);
  }

  getServerBasePaths(): string[] {
    const basePaths = this.servers().map((server) =>
      extractBasePath(server.url),
    );
    return basePaths;
  }

  getMatchingServerUrls(pathname: Pathname): string[] {
    const matchingServerUrls = this.getServerUrls().filter((URL) =>
      pathname.startsWith(extractBasePath(URL)),
    );
    return matchingServerUrls;
  }

  getMatchingServerBasePaths(pathname: Pathname): string[] {
    const matchingServerBasePaths = this.getServerBasePaths().filter(
      (basePath) => pathname.startsWith(basePath),
    );
    return matchingServerBasePaths;
  }

  findOpenApiPathMatchingPathname(pathname: Pathname): OpenAPIPath {
    const matchingServerBasePaths = this.getMatchingServerBasePaths(pathname);
    if (!matchingServerBasePaths.length) {
      throw new ValidationError('SERVER_NOT_FOUND');
    }
    const possiblePathnames = matchingServerBasePaths.map((basePath) =>
      getPathnameWithoutBasePath(basePath, pathname),
    );
    const openApiPath = findOpenApiPathMatchingPossiblePathnames(
      possiblePathnames,
      this.paths(),
    );
    if (!openApiPath) {
      throw new ValidationError('PATH_NOT_FOUND');
    }
    return openApiPath;
  }

  findResponseDefinition($ref: string): OpenAPIV3.ResponseObject {
    const nameOfResponseDefinition = $ref.split('#/components/responses/')[1];
    return this.spec.components.responses[
      nameOfResponseDefinition
    ] as OpenAPIV3.ResponseObject;
  }

  getComponentDefinitions(): OpenAPIV3.ComponentsObject {
    return this.spec.components;
  }

  getComponentDefinitionsProperty(): OpenAPIV3ComponentsProperty {
    return { components: this.getComponentDefinitions() };
  }

  getSchemaObjects(): OpenAPIV3SchemasObject {
    return this.getComponentDefinitions().schemas as OpenAPIV3SchemasObject;
  }
}
