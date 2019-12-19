const PathParser = require('path-parser').default;

const OpenApiSpec = require('./BaseOpenApiSpec');

class OpenApi2Spec extends OpenApiSpec {
  findOpenApiPathMatchingPathname(pathname) {
    const openApiPath = this.paths().find(openApiPath => {
      const pathInColonForm = openApiPath.replace(/{/g, ':').replace(/}/g, ''); // converts all {foo} to :foo
      const pathParser = new PathParser(pathInColonForm);
      const pathParamsInPathname = pathParser.test(pathname); // => one of: null, {}, {exampleParam: 'foo'}
      return !!pathParamsInPathname;
    });
    if (!openApiPath) {
      throw new Error(`No '${pathname}' path defined in OpenAPI spec`);
    }
    return openApiPath;
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
