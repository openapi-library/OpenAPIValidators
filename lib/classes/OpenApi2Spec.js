const utils = require('../utils');
const AbstractOpenApiSpec = require('./AbstractOpenApiSpec');
const ValidationError = require('./errors/ValidationError');

const doesOpenApiPathMatchPathname = (openApiPath, pathname) => {
  const pathInColonForm = utils.convertOpenApiPathToColonForm(openApiPath);
  return utils.doesColonPathMatchPathname(pathInColonForm, pathname);
};

class OpenApi2Spec extends AbstractOpenApiSpec {
  findOpenApiPathMatchingPathname(pathname) {
    const openApiPath = this.paths().find(openApiPath =>
      doesOpenApiPathMatchPathname(openApiPath, pathname)
    );
    if (!openApiPath) {
      throw new ValidationError('PATH_NOT_FOUND');
    }
    return openApiPath;
  }

  /**
   * @returns {ResponseObject} ResponseObject
   * {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responses-definitions-object}
   */
  findResponseDefinition(referenceString) {
    const nameOfResponseDefinition = referenceString.split('#/responses/')[1];
    return this.spec.responses[nameOfResponseDefinition];
  }

  /**
   * @returns {[DefinitionsObject]} DefinitionsObject
   * {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#definitions-object}
   */
  getComponentDefinitions() {
    return this.spec.definitions;
  }

  getComponentDefinitionsProperty() {
    return { definitions: this.getComponentDefinitions() };
  }

  getSchemaObjects() {
    return this.getComponentDefinitions();
  }
}

module.exports = OpenApi2Spec;
