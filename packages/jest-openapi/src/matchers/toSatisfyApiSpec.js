const { c } = require('compress-tag');
const {
  matcherHint,
  RECEIVED_COLOR,
  EXPECTED_COLOR,
} = require('jest-matcher-utils');

const { responseFactory } = require('../openapi-validator');
const { stringify } = require('../utils');

module.exports = function (received, openApiSpec) {
  const actualResponse = responseFactory.makeResponse(received);

  const validationError = openApiSpec.validateResponse(actualResponse);
  const pass = !validationError;

  const matcherHintOptions = {
    comment: 'Matches \'received\' to a response defined in your API spec, then validates \'received\' against it',
    isNot: this.isNot,
    promise: this.promise,
  };
  const hint = matcherHint('toSatisfyApiSpec', undefined, '', matcherHintOptions);
  const message = pass
    ? () => getExpectReceivedNotToSatisfyApiSpecMsg(actualResponse, openApiSpec, hint)
    : () => getExpectReceivedToSatisfyApiSpecMsg(actualResponse, openApiSpec, validationError, hint);

  return {
    pass,
    message,
  };
};

function getExpectReceivedToSatisfyApiSpecMsg(actualResponse, openApiSpec, validationError, hint) {
  const { status, req } = actualResponse;
  const { method, path: requestPath } = req;

  if (['PATH_NOT_FOUND', 'SERVER_NOT_FOUND'].includes(validationError.code)) {
    const endpoint = `${method} ${requestPath}`;
    let msg = `${hint
    }\n\nexpected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec`
      + `\n${RECEIVED_COLOR('received')} had request path ${RECEIVED_COLOR(requestPath)}, but your API spec has no matching path`
      + `\n\nPaths found in API spec: ${EXPECTED_COLOR(openApiSpec.paths().join(', '))}`;
    if (openApiSpec.didUserDefineServers) {
      msg += (validationError.code === 'SERVER_NOT_FOUND')
        ? `\n\n'${requestPath}' matches no servers`
        : `\n\n'${requestPath}' matches servers ${stringify(openApiSpec.getMatchingServerUrls(requestPath))} but no <server/endpointPath> combinations`;
      msg += `\n\nServers found in API spec: ${openApiSpec.getServerUrls().join(', ')}`;
    }
    return msg;
  }

  const path = openApiSpec.findOpenApiPathMatchingRequest(req);
  const endpoint = `${method} ${path}`;

  if (validationError.code === 'METHOD_NOT_FOUND') {
    const expectedPathItem = openApiSpec.findExpectedPathItem(req);
    return c`${hint}
      \n\nexpected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec
      \n${RECEIVED_COLOR('received')} had request method ${RECEIVED_COLOR(method)}, but your API spec has no ${RECEIVED_COLOR(method)} operation defined for path '${path}'
      \n\nRequest operations found for path '${path}' in API spec: ${EXPECTED_COLOR(Object.keys(expectedPathItem).map((op) => op.toUpperCase()).join(', '))}`;
  }

  if (validationError.code === 'STATUS_NOT_FOUND') {
    const expectedResponseOperation = openApiSpec.findExpectedResponseOperation(req);
    const expectedResponseStatuses = Object.keys(expectedResponseOperation.responses).join(', ');
    return c`${hint}
      \n\nexpected ${RECEIVED_COLOR('received')} to satisfy a '${status}' response defined for endpoint '${endpoint}' in your API spec
      \n${RECEIVED_COLOR('received')} had status ${RECEIVED_COLOR(status)}, but your API spec has no ${RECEIVED_COLOR(status)} response defined for endpoint '${endpoint}'
      \n\nResponse statuses found for endpoint '${endpoint}' in API spec: ${EXPECTED_COLOR(expectedResponseStatuses)}`;
  }

  // validationError.code === 'INVALID_BODY'
  const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
  return c`${hint}
    \n\nexpected ${RECEIVED_COLOR('received')} to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec
    \n${RECEIVED_COLOR('received')} did not satisfy it because: ${validationError}
    \n\n${RECEIVED_COLOR('received')} contained: ${RECEIVED_COLOR(actualResponse.toString())}
    \n\nThe '${status}' response defined for endpoint '${endpoint}' in API spec: ${EXPECTED_COLOR(stringify(responseDefinition))}`;
}

function getExpectReceivedNotToSatisfyApiSpecMsg(actualResponse, openApiSpec, hint) {
  const { status, req } = actualResponse;
  const responseDefinition = openApiSpec.findExpectedResponse(actualResponse);
  const endpoint = `${req.method} ${openApiSpec.findOpenApiPathMatchingRequest(req)}`;

  return c`${hint}
    \n\nexpected ${RECEIVED_COLOR('received')} not to satisfy the '${status}' response defined for endpoint '${endpoint}' in your API spec
    \n\n${RECEIVED_COLOR('received')} contained: ${RECEIVED_COLOR(actualResponse.toString())}
    \n\nThe '${status}' response defined for endpoint '${endpoint}' in API spec: ${EXPECTED_COLOR(stringify(responseDefinition))}`;
}
