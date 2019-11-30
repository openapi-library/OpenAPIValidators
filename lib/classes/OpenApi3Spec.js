const OpenApiSpec = require('./BaseOpenApiSpec');

class OpenApi3Spec extends OpenApiSpec {
  /**
   * @returns {[ServerObject]} [ServerObject] {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#server-object}
   */
  servers() {
    return this.spec.servers;
  }

  findMatchingServer(pathname) {
    const matchingServer = this.servers().find(server => pathname.startsWith(server.url));
    if (!matchingServer) {
      throw new Error(`No server matching '${pathname}' path defined in OpenAPI spec`);
    }
    return matchingServer;
  }

  cleanPathname(pathname) {
    const serverUsed = this.findMatchingServer(pathname);
    return pathname.replace(serverUsed.url, '');
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
