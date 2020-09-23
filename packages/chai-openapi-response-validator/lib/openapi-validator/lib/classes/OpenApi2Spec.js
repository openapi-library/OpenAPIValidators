const utils = require('../utils');
const AbstractOpenApiSpec = require('./AbstractOpenApiSpec');
const ValidationError = require('./errors/ValidationError');

const serversPropertyNotProvidedOrIsEmptyArray = (spec) =>
  !Object.prototype.hasOwnProperty.call(spec, 'servers') ||
  !spec.servers.length;

class OpenApi2Spec extends AbstractOpenApiSpec {
  constructor(spec) {
    super(spec);
    this.didUserDefineBasePath = Object.prototype.hasOwnProperty.call(spec, 'basePath');
  }
  findOpenApiPathMatchingPathname(pathname) {
    const { basePath } = this.spec;
    if(basePath && !pathname.startsWith(basePath)) {
      throw new ValidationError('SERVER_NOT_FOUND');
    }
    const pathnameWithoutBasePath = pathname.replace(basePath, '');
    const openApiPath = utils.findOpenApiPathMatchingPossiblePathnames(
      [pathnameWithoutBasePath],
      this.paths(),
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
