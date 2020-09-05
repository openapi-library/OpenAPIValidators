const { c } = require('compress-tag');

const { responseFactory } = require('../openapi-validator');
const { stringify } = require('../utils');

module.exports = function (chai, openApiSpec) {
  const { Assertion } = chai;

  Assertion.addProperty('satisfyApiSpec', function () {
    const actualResponse = responseFactory.makeResponse(this._obj); // eslint-disable-line no-underscore-dangle
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

  const { status, req } = actualResponse;
  const { method, path: requestPath } = req;

  if (['PATH_NOT_FOUND', 'SERVER_NOT_FOUND'].includes(validationError.code)) {
    const endpoint = `${method} ${requestPath}`;
    let msg =
      'expected res to satisfy API spec' +
      `\n\nexpected res to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec` +
      `\nres had request path '${requestPath}', but your API spec has no matching path` +
      `\n\nPaths found in API spec: ${openApiSpec.paths().join(', ')}`;
    if (openApiSpec.didUserDefineServers) {
      msg +=
        validationError.code === 'SERVER_NOT_FOUND'
          ? `\n\n'${requestPath}' matches no servers`
          : `\n\n'${requestPath}' matches servers ${stringify(
              openApiSpec.getMatchingServerUrls(requestPath),
            )} but no <server/endpointPath> combinations`;
      msg += `\n\nServers found in API spec: ${openApiSpec
        .getServerUrls()
        .join(', ')}`;
    }
    return msg;
  }

  const path = openApiSpec.findOpenApiPathMatchingRequest(req);
  const endpoint = `${method} ${path}`;

  if (validationError.code === 'METHOD_NOT_FOUND') {
    const expectedPathItem = openApiSpec.findExpectedPathItem(req);
    return c`expected res to satisfy API spec
      \n\nexpected res to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec
      \nres had request method '${method}', but your API spec has no '${method}' operation defined for path '${path}'
      \n\nRequest operations found for path '${path}' in API spec: ${Object.keys(
      expectedPathItem,
    )
      .map((op) => op.toUpperCase())
      .join(', ')}`;
  }

  if (validationError.code === 'STATUS_NOT_FOUND') {
    const expectedResponseOperation = openApiSpec.findExpectedResponseOperation(
      req,
    );
    const expectedResponseStatuses = Object.keys(
      expectedResponseOperation.responses,
    ).join(', ');
    return c`expected res to satisfy API spec
        \n\nexpected res to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec
        \nres had status '${status}', but your API spec has no '${status}' response defined for endpoint '${endpoint}'
        \n\nResponse statuses found for endpoint '${endpoint}' in API spec: ${expectedResponseStatuses}`;
  }

  // validationError.code === 'INVALID_BODY'
  const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
  return c`expected res to satisfy API spec
    \n\nexpected res to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec
    \nres did not satisfy it because: ${validationError}
    \n\nres contained: ${actualResponse.toString()}
    \n\nThe '${status}' response defined for endpoint '${endpoint}' in API spec: ${stringify(
    responseDefinition,
  )}`;
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

  return c`expected res not to satisfy API spec
    \n\nexpected res not to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec
    \n\nres contained: ${actualResponse.toString()}
    \n\nThe '${status}' response defined for endpoint '${endpoint}' in API spec: ${stringify(
    responseDefinition,
  )}`;
}
