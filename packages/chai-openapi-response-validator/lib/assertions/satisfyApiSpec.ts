import {
  ActualResponse,
  ErrorCode,
  makeResponse,
  OpenApi2Spec,
  OpenApi3Spec,
  OpenApiSpec,
  ValidationError,
} from 'openapi-validator';
import { joinWithNewLines, stringify } from '../utils';

export default function (
  chai: Chai.ChaiStatic,
  openApiSpec: OpenApiSpec,
): void {
  const { Assertion } = chai;

  Assertion.addProperty('satisfyApiSpec', function () {
    const actualResponse = makeResponse(this._obj); // eslint-disable-line no-underscore-dangle

    const validationError = openApiSpec.validateResponse(actualResponse);
    const pass = !validationError;
    this.assert(
      pass,
      pass
        ? ''
        : getExpectedResToSatisfyApiSpecMsg(
            actualResponse,
            openApiSpec,
            validationError,
          ),
      pass
        ? getExpectedResNotToSatisfyApiSpecMsg(actualResponse, openApiSpec)
        : '',
      null,
    );
  });
}

function getExpectedResToSatisfyApiSpecMsg(
  actualResponse: ActualResponse,
  openApiSpec: OpenApiSpec,
  validationError: ValidationError,
): string {
  const hint = 'expected res to satisfy API spec';

  const { status, req } = actualResponse;
  const { method, path: requestPath } = req;
  const unmatchedEndpoint = `${method} ${requestPath}`;

  if (validationError.code === ErrorCode.ServerNotFound) {
    return joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `res had request path '${requestPath}', but your API spec has no matching servers`,
      `Servers found in API spec: ${(openApiSpec as OpenApi3Spec)
        .getServerUrls()
        .join(', ')}`,
    );
  }

  if (validationError.code === ErrorCode.BasePathNotFound) {
    return joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `res had request path '${requestPath}', but your API spec has basePath '${
        (openApiSpec as OpenApi2Spec).spec.basePath
      }'`,
    );
  }

  if (validationError.code === ErrorCode.PathNotFound) {
    const pathNotFoundErrorMessage = joinWithNewLines(
      hint,
      `expected res to satisfy a '${status}' response defined for endpoint '${unmatchedEndpoint}' in your API spec`,
      `res had request path '${requestPath}', but your API spec has no matching path`,
      `Paths found in API spec: ${openApiSpec.paths().join(', ')}`,
    );

    if (
      'didUserDefineBasePath' in openApiSpec &&
      openApiSpec.didUserDefineBasePath
    ) {
      return joinWithNewLines(
        pathNotFoundErrorMessage,
        `'${requestPath}' matches basePath \`${openApiSpec.spec.basePath}\` but no <basePath/endpointPath> combinations`,
      );
    }

    if (
      'didUserDefineServers' in openApiSpec &&
      openApiSpec.didUserDefineServers
    ) {
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

  if (validationError.code === ErrorCode.MethodNotFound) {
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

  if (validationError.code === ErrorCode.StatusNotFound) {
    const expectedResponseOperation =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      openApiSpec.findExpectedResponseOperation(req)!;
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

  // validationError.code === ErrorCode.InvalidBody
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
  actualResponse: ActualResponse,
  openApiSpec: OpenApiSpec,
): string {
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
