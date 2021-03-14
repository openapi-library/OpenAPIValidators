const {
  matcherHint,
  RECEIVED_COLOR,
  EXPECTED_COLOR,
} = require('jest-matcher-utils');

const { makeResponse } = require('openapi-validator');
const { stringify, joinWithNewLines } = require('../utils');

module.exports = function (received, openApiSpec) {
  const actualResponse = makeResponse(received);

  const validationError = openApiSpec.validateResponse(actualResponse);
  const pass = !validationError;

  const matcherHintOptions = {
    comment:
      "Matches 'received' to a response defined in your API spec, then validates 'received' against it",
    isNot: this.isNot,
    promise: this.promise,
  };
  const hint = matcherHint(
    'toSatisfyApiSpec',
    undefined,
    '',
    matcherHintOptions,
  );
  const message = pass
    ? () =>
        getExpectReceivedNotToSatisfyApiSpecMsg(
          actualResponse,
          openApiSpec,
          hint,
        )
    : () =>
        getExpectReceivedToSatisfyApiSpecMsg(
          actualResponse,
          openApiSpec,
          validationError,
          hint,
        );

  return {
    pass,
    message,
  };
};

function getExpectReceivedToSatisfyApiSpecMsg(
  actualResponse,
  openApiSpec,
  validationError,
  hint,
) {
  const { status, req } = actualResponse;
  const { method, path: requestPath } = req;
  const unmatchedEndpoint = `${method} ${requestPath}`;

  if (validationError.code === `SERVER_NOT_FOUND`) {
    // prettier-ignore
    return joinWithNewLines(
      hint,
      `expected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `${RECEIVED_COLOR('received')} had request path ${RECEIVED_COLOR(requestPath)}, but your API spec has no matching servers`,
      `Servers found in API spec: ${EXPECTED_COLOR(openApiSpec.getServerUrls().join(', '))}`,
    );
  }

  if (validationError.code === `BASE_PATH_NOT_FOUND`) {
    // prettier-ignore
    return joinWithNewLines(
      hint,
      `expected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `${RECEIVED_COLOR('received')} had request path ${RECEIVED_COLOR(requestPath)}, but your API spec has basePath ${EXPECTED_COLOR(openApiSpec.spec.basePath)}`,
    );
  }

  if (validationError.code === `PATH_NOT_FOUND`) {
    // prettier-ignore
    const pathNotFoundErrorMessage = joinWithNewLines(
      hint,
      `expected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `${RECEIVED_COLOR('received')} had request path ${RECEIVED_COLOR(requestPath)}, but your API spec has no matching path`,
      `Paths found in API spec: ${EXPECTED_COLOR(openApiSpec.paths().join(', '))}`,
    );

    if (openApiSpec.didUserDefineBasePath) {
      // prettier-ignore
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
    // prettier-ignore
    return joinWithNewLines(
      hint,
      `expected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec`,
      `${RECEIVED_COLOR('received')} had request method ${RECEIVED_COLOR(method)}, but your API spec has no ${RECEIVED_COLOR(method)} operation defined for path '${path}'`,
      `Request operations found for path '${path}' in API spec: ${EXPECTED_COLOR(expectedRequestOperations)}`,
    );
  }

  if (validationError.code === 'STATUS_NOT_FOUND') {
    const expectedResponseOperation = openApiSpec.findExpectedResponseOperation(
      req,
    );
    const expectedResponseStatuses = Object.keys(
      expectedResponseOperation.responses,
    ).join(', ');
    // prettier-ignore
    return joinWithNewLines(
      hint,
      `expected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec`,
      `${RECEIVED_COLOR('received')} had status ${RECEIVED_COLOR(status)}, but your API spec has no ${RECEIVED_COLOR(status)} response defined for endpoint '${endpoint}'`,
      `Response statuses found for endpoint '${endpoint}' in API spec: ${EXPECTED_COLOR(expectedResponseStatuses)}`,
    );
  }

  // validationError.code === 'INVALID_BODY'
  const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
  // prettier-ignore
  return joinWithNewLines(
    hint,
    `expected ${RECEIVED_COLOR('received')} to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec`,
    `${RECEIVED_COLOR('received')} did not satisfy it because: ${validationError}`,
    `${RECEIVED_COLOR('received')} contained: ${RECEIVED_COLOR(actualResponse.toString())}`,
    `The '${status}' response defined for endpoint '${endpoint}' in API spec: ${EXPECTED_COLOR(stringify(responseDefinition))}`,
  );
}

function getExpectReceivedNotToSatisfyApiSpecMsg(
  actualResponse,
  openApiSpec,
  hint,
) {
  const { status, req } = actualResponse;
  const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
  const endpoint = `${req.method} ${openApiSpec.findOpenApiPathMatchingRequest(
    req,
  )}`;

  // prettier-ignore
  return joinWithNewLines(
    hint,
    `expected ${RECEIVED_COLOR('received')} not to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec`,
    `${RECEIVED_COLOR('received')} contained: ${RECEIVED_COLOR(actualResponse.toString())}`,
    `The '${status}' response defined for endpoint '${endpoint}' in API spec: ${EXPECTED_COLOR(stringify(responseDefinition))}`,
  );
}
