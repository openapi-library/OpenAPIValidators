const { inspect } = require('util');
const url = require('url');

const utils = require('../utils');
const OpenApiSpec = require('./BaseOpenApiSpec');

const serversPropNotProvidedOrIsEmptyArray = (spec) =>
  (!spec.hasOwnProperty('servers') || !spec.servers.length);

const extractBasePath = (inputUrl) => url.parse(inputUrl).path;

const removeBasePathFromPathname = (basePath, pathname) =>
  (basePath === '/')
    ? pathname
    : pathname.replace(basePath, '');

const doesOpenApiPathMatchPathname = (openApiPath, pathname, matchingServerBasePaths) => {
  const pathInColonForm = utils.convertOpenApiPathToColonForm(openApiPath);
  const openApiPathMatchesPathname = matchingServerBasePaths.some(basePath => {
    const pathnameWithoutServerBasePath = removeBasePathFromPathname(basePath, pathname);
    return utils.doesColonPathMatchPathname(pathInColonForm, pathnameWithoutServerBasePath);
  });
  return openApiPathMatchesPathname;
};

class OpenApi3Spec extends OpenApiSpec {
  constructor(spec) {
    super(spec);
    this.ensureDefaultServer();
  }

  /**
   * "If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of '/'"
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#fixed-fields
   */
  ensureDefaultServer() {
    if (serversPropNotProvidedOrIsEmptyArray(this.spec)) {
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
    return this.servers().map(server => server.url);
  }

  getServerBasePaths() {
    const basePaths = this.servers().map(server => extractBasePath(server.url));
    return basePaths;
  }

  getMatchingServerUrls(pathname) {
    const matchingServerUrls = this.getServerUrls()
      .filter(url => pathname.startsWith(extractBasePath(url)));
    return matchingServerUrls;
  }

  getMatchingServerBasePaths(pathname) {
    const matchingServerBasePaths = this.getServerBasePaths()
      .filter(basePath => pathname.startsWith(basePath));
    return matchingServerBasePaths;
  }

  findOpenApiPathMatchingPathname(pathname) {
    const matchingServerBasePaths = this.getMatchingServerBasePaths(pathname);
    if (!matchingServerBasePaths.length) {
      throw new Error(`No server matching '${pathname}' path defined in OpenAPI spec`);
    }
    const openApiPath = this.paths().find(openApiPath =>
      doesOpenApiPathMatchPathname(openApiPath, pathname, matchingServerBasePaths)
    );
    if (!openApiPath) {
      const matchingServerUrls = this.getMatchingServerUrls(pathname);
      throw new Error(`No '${pathname}' path defined in OpenAPI spec. (Matches servers ${inspect(matchingServerUrls)} but no 'server/endpointPath' combinations)`);
    }
    return openApiPath;
  }

  /**
   * @returns {ResponseObject} ResponseObject {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsResponses}
   */
  findResponseDefinition(referenceString) {
    const nameOfResponseDefinition = referenceString.split('#/components/responses/')[1];
    return this.spec.components.responses[nameOfResponseDefinition];
  }

  /**
   * @see ComponentsObject {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsObject}
   */
  getVersionSpecificValidatorOptions() {
    return { components: this.spec.components };
  }
}

module.exports = OpenApi3Spec;
