const util = require('util');
const PathParser = require('path-parser').default;

const OpenApiSpec = require('./BaseOpenApiSpec');

const serversPropNotProvidedOrIsEmptyArray = (spec) =>
  (!spec.hasOwnProperty('servers') || !spec.servers.length);

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

  findMatchingServerUrls(pathname) {
    const matchingServers = this.servers().filter(server => pathname.startsWith(server.url));
    if (!matchingServers.length) {
      throw new Error(`No server matching '${pathname}' path defined in OpenAPI spec`);
    }
    const matchingServerUrls = matchingServers.map(server => server.url);
    return matchingServerUrls;
  }

  findOpenApiPathMatchingPathname(pathname) {
    const matchingServerUrls = this.findMatchingServerUrls(pathname);
    const openApiPath = this.paths().find(openApiPath => {
      const pathInColonForm = openApiPath.replace(/{/g, ':').replace(/}/g, ''); // converts all {foo} to :foo
      const pathParser = new PathParser(pathInColonForm);
      for (const serverUrl of matchingServerUrls) {
        const pathnameWithoutServerUrl = serverUrl === '/' ? pathname : pathname.replace(serverUrl, '');
        const pathParamsInPathname = pathParser.test(pathnameWithoutServerUrl); // => one of: null, {}, {exampleParam: 'foo'}
        if (pathParamsInPathname) {
          return true;
        }
      }
    });
    if (!openApiPath) {
      throw new Error(`No '${pathname}' path defined in OpenAPI spec. (Matches servers ${util.inspect(matchingServerUrls)} but no 'serverUrl/endpointPath' combinations)`);
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
