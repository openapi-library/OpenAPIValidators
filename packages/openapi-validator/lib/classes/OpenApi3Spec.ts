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
import ValidationError from './errors/ValidationError';

export default class OpenApi3Spec extends AbstractOpenApiSpec {
  public didUserDefineServers: boolean;

  constructor(spec) {
    super(spec);
    this.didUserDefineServers = !serversPropertyNotProvidedOrIsEmptyArray(spec);
    this.ensureDefaultServer();
  }

  /**
   * "If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of '/'"
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#fixed-fields
   */
  ensureDefaultServer() {
    if (serversPropertyNotProvidedOrIsEmptyArray(this.spec)) {
      this.spec.servers = [{ url: defaultBasePath }];
    }
  }

  /**
   * @returns {[ServerObject]} [ServerObject] {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#server-object}
   */
  servers() {
    return this.spec.servers;
  }

  getServerUrls() {
    return this.servers().map((server) => server.url);
  }

  getMatchingServerUrls(pathname) {
    return getMatchingServerUrlsAndServerBasePaths(
      this.servers(),
      pathname,
    ).map(({ concreteUrl }) => concreteUrl);
  }

  getMatchingServerBasePaths(pathname) {
    return getMatchingServerUrlsAndServerBasePaths(
      this.servers(),
      pathname,
    ).map(({ matchingBasePath }) => matchingBasePath);
  }

  findOpenApiPathMatchingPathname(pathname) {
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

  /**
   * @returns {ResponseObject} ResponseObject
   * {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsResponses}
   */
  findResponseDefinition(referenceString) {
    const nameOfResponseDefinition = referenceString.split(
      '#/components/responses/',
    )[1];
    return this.spec.components.responses[nameOfResponseDefinition];
  }

  /**
   * @returns {[ComponentsObject]} ComponentsObject
   * {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsObject}
   */
  getComponentDefinitions() {
    return this.spec.components;
  }

  getComponentDefinitionsProperty() {
    return { components: this.getComponentDefinitions() };
  }

  getSchemaObjects() {
    return this.getComponentDefinitions().schemas;
  }
}
