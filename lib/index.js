/*******************************************************************************
 * Copyright 2019 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

const fs = require('fs-extra');
const yaml = require('js-yaml');
const FilePath = require('path');
const url = require('url');
const PathParser = require('path-parser').default;
const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const OpenAPIResponseValidator = require('openapi-response-validator').default;

const utils = require('./utils');
const Response = require('./Response');

// In this file, 'OA' means 'Open API'

module.exports = function (pathToOpenApiSpec) {
  const openApiSpec = parseOpenApiFile(pathToOpenApiSpec);

  return function (chai) {
    const Assertion = chai.Assertion;

    Assertion.addProperty('satisfyApiSpec', function () {
      const res = new Response(this._obj);
      const req = res.req();

      const expectedResponse = findResExpectedByApiSpec(res, openApiSpec);

      const validationError = validateResAgainstApiSpec(res, expectedResponse, openApiSpec);
      if (validationError) {
        validationError.actualResponse = res.summary();
      }

      this.assert(
        !validationError,
        `expected res to satisfy API spec:\n${utils.stringify(validationError)}`,
        `expected res not to satisfy API spec for '${res.status()}' response defined for endpoint '${req.method} ${getOAPath(req, openApiSpec)}' in OpenAPI spec\nres: ${res.toString()}`,
      );
    });
  };
};

function parseOpenApiFile(filePath) {
  if (!FilePath.isAbsolute(filePath)) {
    throw new Error('The "path" argument must be an absolute filepath');
  }
  const fileData = fs.readFileSync(filePath);
  let openApiSpec;
  try {
    openApiSpec = yaml.safeLoad(fileData);
  } catch (error) {
    throw new Error(`Unable to read the specified OpenAPI document. File is invalid YAML or JSON:\n${error.message}`);
  }

  try {
    const validator = new OpenAPISchemaValidator({ version: getOAVersion(openApiSpec) });
    const { errors } = validator.validate(openApiSpec);
    if (errors.length > 0) {
      throw new Error(utils.stringify(errors));
    }
  } catch (error) {
    throw new Error(`File is not a valid OpenAPI spec.\nError(s): ${error.message}`);
  }

  return openApiSpec;
}

function getOAVersion(openApiSpec) {
  return openApiSpec.swagger || openApiSpec.openapi;
}

function findResExpectedByApiSpec(res, openApiSpec) {
  const req = res.req();
  const openApiPath = getOAPath(req, openApiSpec);
  const pathObj = openApiSpec.paths[openApiPath];
  if (!pathObj) {
    throw new Error(`No '${openApiPath}' path defined in OpenAPI spec`);
  }

  const httpMethod = req.method;
  const endpointObj = pathObj[httpMethod.toLowerCase()];
  if (!endpointObj) {
    throw new Error(`No '${req.method}' method defined for path '${openApiPath}' in OpenAPI spec`);
  }

  const status = res.status();
  let expectedResponse = endpointObj.responses[status];
  if (expectedResponse && expectedResponse['$ref']) {
    expectedResponse = findResponseDefinitionObject(expectedResponse['$ref'], openApiSpec);
  }
  if (!expectedResponse) {
    throw new Error(`No '${status}' response defined for endpoint '${httpMethod} ${openApiPath}' in OpenAPI spec`);
  }

  return { [status]: expectedResponse };
}

function findResponseDefinitionObject(referenceString, openApiSpec) {
  try { // OpenAPI 3
    const nameOfReferencedResponseDefinition = referenceString.split('#/components/responses/')[1];
    return openApiSpec.components.responses[nameOfReferencedResponseDefinition];
  } catch (error) { // OpenAPI 2
    const nameOfReferencedResponseDefinition = referenceString.split('#/responses/')[1];
    return openApiSpec.responses[nameOfReferencedResponseDefinition];
  }
}

function validateResAgainstApiSpec(res, expectedResponse, openApiSpec) {
  const resValidator = new OpenAPIResponseValidator({
    responses: expectedResponse,
    components: openApiSpec.components, // needed if openApiSpec is OpenAPI 3
    definitions: openApiSpec.definitions, // needed if openApiSpec is OpenAPI 2
  });

  const [expectedResStatus] = Object.keys(expectedResponse);
  const validationError = resValidator.validateResponse(expectedResStatus, res.body());
  return validationError;
}

function getOAPath(req, openApiSpec) {
  const pathname = url.parse(req.path).pathname; // excludes the query (because: path = pathname + query)

  const serverUrl = getServerUrlUsed(pathname, openApiSpec.servers);

  // if servers have been defined but none of the servers match the current path
  if (openApiSpec.servers && !serverUrl) {
    throw new Error(`No server matching '${pathname}' path defined in OpenAPI spec`);
  }
  const pathnameWithoutServerUrl = removeServerURLFromPath(pathname, serverUrl);
  const OAPath = findOAPathMatchingPathname(pathnameWithoutServerUrl, openApiSpec);
  return OAPath || pathnameWithoutServerUrl;
}

function findOAPathMatchingPathname(pathname, openApiSpec) {
  const OAPaths = Object.keys(openApiSpec.paths);
  const OAPath = OAPaths.find(OAPath => {
    const pathInColonForm = OAPath.replace(/{/g, ':').replace(/}/g, ''); // converts all {foo} to :foo
    const pathParser = new PathParser(pathInColonForm);
    const pathParamsInPathname = pathParser.test(pathname);
    return !!pathParamsInPathname;
  });
  return OAPath;
}

function getServerUrlUsed(openApiPathWithServerUrl, servers) {
  if (!servers) {
    return null;
  }
  const serverUsed = servers.find(server => openApiPathWithServerUrl.startsWith(server.url));
  return serverUsed ? serverUsed.url : null;
}

function removeServerURLFromPath(openApiPathWithServerUrl, serverUrlUsed) {
  return openApiPathWithServerUrl.replace(serverUrlUsed, '');
}
