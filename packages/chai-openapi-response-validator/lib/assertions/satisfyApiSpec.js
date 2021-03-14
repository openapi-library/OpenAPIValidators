const { makeResponse } = require('openapi-validator');
const { stringify, joinWithNewLines } = require('../utils');

module.exports = function (chai, openApiSpec) {
  const { Assertion } = chai;

  Assertion.addProperty('satisfyApiSpec', function () {
    const actualResponse = makeResponse(this._obj); // eslint-disable-line no-underscore-dangle
    const validationError = openApiSpec.validateResponse(actualResponse);
    const predicate = !validationError;
    this.assert(
      predicate,
      getExpectedResToSatisfyApiSpecMsg(
        actualResponse,
        openApiSpec,
        validationError,
      ),
      getExpectedResNotToSatisfyApiSpecMsg(
        actualResponse,
        openApiSpec,
        validationError,
      ),
    );
  });
};

function getExpectedResToSatisfyApiSpecMsg(
  actualResponse,
  openApiSpec,
  validationError,
) {
  if (!validationError) {
    return null;
  }
  const hint = 'expected res to satisfy API spec';

  const { status, req } = actualResponse;
  const { method, path: requestPath } = req;
  const unmatchedEndpoint = `${method} ${requestPath}`;

  if (validationError.code === `SERVER_NOT_FOUND`) {
    return joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `res had request path '${requestPath}', but your API spec has no matching servers`,
      `Servers found in API spec: ${openApiSpec.getServerUrls().join(', ')}`,
    );
  }

  if (validationError.code === `BASE_PATH_NOT_FOUND`) {
    return joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `res had request path '${requestPath}', but your API spec has basePath '${openApiSpec.spec.basePath}'`,
    );
  }

  if (validationError.code === `PATH_NOT_FOUND`) {
    const pathNotFoundErrorMessage = joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `res had request path '${requestPath}', but your API spec has no matching path`,
      `Paths found in API spec: ${openApiSpec.paths().join(', ')}`,
    );

    if (openApiSpec.didUserDefineBasePath) {
      return joinWithNewLines(
        pathNotFoundErrorMessage,
        `'${requestPath}' matches basePath \`${openApiSpec.spec.basePath}\` but no <basePath/endpointPath> combinations`,
      );
    }

    if (openApiSpec.didUserDefineServers) {
      return joinWithNewLines(
        pathNotFoundErrorMessage,
        `'${requestPath}' matches servers ${stringify(
          openApiSpec.getMatchingServerUrls(requestPath),
        )} but no <server/endpointPath> combinations`,
      );
    }
    return pathNotFoundErrorMessage;
  }

  const path = openApiSpec.findOpenApiPathMatchingRequest(req);
  const endpoint = `${method} ${path}`;

  if (validationError.code === 'METHOD_NOT_FOUND') {
    const expectedPathItem = openApiSpec.findExpectedPathItem(req);
    const expectedRequestOperations = Object.keys(expectedPathItem)
      .map((operation) => operation.toUpperCase())
      .join(', ');
    return joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec`,
      `res had request method '${method}', but your API spec has no '${method}' operation defined for path '${path}'`,
      `Request operations found for path '${path}' in API spec: ${expectedRequestOperations}`,
    );
  }

  if (validationError.code === 'STATUS_NOT_FOUND') {
    const expectedResponseOperation = openApiSpec.findExpectedResponseOperation(
      req,
    );
    const expectedResponseStatuses = Object.keys(
      expectedResponseOperation.responses,
    ).join(', ');
    return joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec`,
      `res had status '${status}', but your API spec has no '${status}' response defined for endpoint '${endpoint}'`,
      `Response statuses found for endpoint '${endpoint}' in API spec: ${expectedResponseStatuses}`,
    );
  }

  // validationError.code === 'INVALID_BODY'
  const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
  return joinWithNewLines(
    hint,
    `expected res to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec`,
    `res did not satisfy it because: ${validationError}`,
    `res contained: ${actualResponse.toString()}`,
    `The '${status}' response defined for endpoint '${endpoint}' in API spec: ${stringify(
      responseDefinition,
    )}`,
  );
}

function getExpectedResNotToSatisfyApiSpecMsg(
  actualResponse,
  openApiSpec,
  validationError,
) {
  if (validationError) {
    return null;
  }

  const { status, req } = actualResponse;
  const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
  const endpoint = `${req.method} ${openApiSpec.findOpenApiPathMatchingRequest(
    req,
  )}`;

  return joinWithNewLines(
    `expected res not to satisfy API spec`,
    `expected res not to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec`,
    `res contained: ${actualResponse.toString()}`,
    `The '${status}' response defined for endpoint '${endpoint}' in API spec: ${stringify(
      responseDefinition,
    )}`,
  );
}
