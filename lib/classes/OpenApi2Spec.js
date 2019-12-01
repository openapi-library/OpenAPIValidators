const OpenApiSpec = require('./BaseOpenApiSpec');

class OpenApi2Spec extends OpenApiSpec {
  cleanPathname(pathname) {
    return pathname;
  }

  /**
   * @returns {ResponseObject} ResponseObject {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responses-definitions-object}
   */
  findResponseDefinition(referenceString) {
    const nameOfResponseDefinition = referenceString.split('#/responses/')[1];
    return this.spec.responses[nameOfResponseDefinition];
  }

  /**
   * @see DefinitionsObject {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#definitions-object}
   */
  getVersionSpecificValidatorOptions() {
    return { definitions: this.spec.definitions };
  }
}

module.exports = OpenApi2Spec;
