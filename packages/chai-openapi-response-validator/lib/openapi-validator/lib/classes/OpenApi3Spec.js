const url = require('url');

const utils = require('../utils');
const AbstractOpenApiSpec = require('./AbstractOpenApiSpec');
const ValidationError = require('./errors/ValidationError');

const serversPropertyNotProvidedOrIsEmptyArray = (spec) => (
  !Object.prototype.hasOwnProperty.call(spec, 'servers')
  || !spec.servers.length
);

const extractBasePath = (inputUrl) => url.parse(inputUrl).path;

const getPathnameWithoutBasePath = (basePath, pathname) => ((basePath === '/')
  ? pathname
  : pathname.replace(basePath, ''));

class OpenApi3Spec extends AbstractOpenApiSpec {
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
      this.spec.servers = [{ url: '/' }];
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

  getServerBasePaths() {
    const basePaths = this.servers().map((server) => extractBasePath(server.url));
    return basePaths;
  }

  getMatchingServerUrls(pathname) {
    const matchingServerUrls = this.getServerUrls()
      .filter((URL) => pathname.startsWith(extractBasePath(URL)));
    return matchingServerUrls;
  }

  getMatchingServerBasePaths(pathname) {
    const matchingServerBasePaths = this.getServerBasePaths()
      .filter((basePath) => pathname.startsWith(basePath));
    return matchingServerBasePaths;
  }

  findOpenApiPathMatchingPathname(pathname) {
    const matchingServerBasePaths = this.getMatchingServerBasePaths(pathname);
    if (!matchingServerBasePaths.length) {
      throw new ValidationError('SERVER_NOT_FOUND');
    }
    const possiblePathnames = matchingServerBasePaths.map(
      (basePath) => getPathnameWithoutBasePath(basePath, pathname),
    );
    const openApiPath = utils.findOpenApiPathMatchingPossiblePathnames(possiblePathnames, this.paths());
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
    const nameOfResponseDefinition = referenceString.split('#/components/responses/')[1];
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

module.exports = OpenApi3Spec;
