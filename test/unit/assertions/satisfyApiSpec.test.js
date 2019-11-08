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

const chai = require('chai');
const path = require('path');
const util = require('util');

const chaiResponseValidator = require('../../..');

const openApiSpecs = [
  {
    openApiVersion: 2,
    pathToApiSpec: path.resolve('test/exampleOpenApiFiles/valid/openapi2.json'),
  },
  {
    openApiVersion: 3,
    pathToApiSpec: path.resolve('test/exampleOpenApiFiles/valid/openapi3.yml'),
  },
];
const { expect } = chai;

for (const spec of openApiSpecs) {
  const { openApiVersion, pathToApiSpec } = spec;

  // add a path to a server if testing in openAPI 3
  const serverPath = openApiVersion == 3 ? '/local' : '';

  describe(`expect(res).to.satisfyApiSpec (using an OpenAPI ${openApiVersion} spec)`, function () {
    before(function () {
      chai.use(chaiResponseValidator(pathToApiSpec));
    });
    describe('when \'res\' matches a response defined in the API spec', function () {
      describe('\'res\' satisfies the spec', function () {
        describe('spec expects res.body to', function () {
          describe('be a string', function () {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: `${serverPath}/test/responseBody/string`,
              },
              body: 'valid body (string)',
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const resThatShouldNotSatisfySpec = util.inspect({
                status: 200,
                body: 'valid body (string)',
                text: undefined,
              });
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(`expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/responseBody/string' in OpenAPI spec\nres: ${resThatShouldNotSatisfySpec}`);
            });
          });

          describe('match a (string) schema', function () {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: `${serverPath}/test/responseBody/schemaDef`,
              },
              body: 'valid body (string)',
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'200\' response defined for endpoint \'GET /test/responseBody/schemaDef\' in OpenAPI spec');
            });
          });

          describe('be empty', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/responseBody/empty`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/responseBody/empty\' in OpenAPI spec');
            });
          });
        });

        describe('res.req.path matches multiple expected responses', function () {
          describe('1st expected response', function () {
            const res = {
              status: 201,
              req: {
                method: 'GET',
                path: `${serverPath}/test/multipleResponsesDefined`,
              },
              body: 'valid body (string)',
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'201\' response defined for endpoint \'GET /test/multipleResponsesDefined\' in OpenAPI spec');
            });
          });

          describe('2nd expected response', function () {
            const res = {
              status: 202,
              req: {
                method: 'GET',
                path: `${serverPath}/test/multipleResponsesDefined`,
              },
              body: 123456, // valid body (integer)
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'202\' response defined for endpoint \'GET /test/multipleResponsesDefined\' in OpenAPI spec');
            });
          });

          describe('3rd expected response', function () {
            const res = {
              status: 203,
              req: {
                method: 'GET',
                path: `${serverPath}/test/multipleResponsesDefined`,
              },
              // no body
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'203\' response defined for endpoint \'GET /test/multipleResponsesDefined\' in OpenAPI spec');
            });
          });
        });

        describe('res.req.path contains parameters', function () {
          describe('a query param', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/queryParams?exampleQueryParam=foo`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/queryParams\' in OpenAPI spec');
            });
          });

          describe('multiple query params', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/queryParams?${'exampleQueryParam=foo'}&${'exampleQueryParam2=bar'}`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/queryParams\' in OpenAPI spec');
            });
          });

          describe('a path param', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/pathParams/foo`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/pathParams/{exampleParam}\' in OpenAPI spec');
            });
          });

          describe('multiple path params', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/multiplePathParams/foo/bar`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/multiplePathParams/{param1}/{param2}\' in OpenAPI spec');
            });
          });

          describe('path and query params together', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/pathAndQueryParams/${'foo'}?${'exampleQueryParam=bar'}`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/pathAndQueryParams/{examplePathParam}\' in OpenAPI spec');
            });
          });
        });
      });
      describe('\'res\' does NOT satisfy the spec', function () {
        describe('wrong res.status', function () {
          const res = {
            status: 418,
            req: {
              method: 'GET',
              path: `${serverPath}/test/responseStatus`,
            },
          };

          it('fails', function () {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw('No \'418\' response defined for endpoint \'GET /test/responseStatus\' in OpenAPI spec');
          });

          it('fails when using .not', function () {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw('No \'418\' response defined for endpoint \'GET /test/responseStatus\' in OpenAPI spec');
          });
        });

        describe('wrong res.body', function () {
          describe('flat res.body', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/responseBody/empty`,
              },
              body: 'invalid body (should be empty)',
            };

            it('fails and outputs a useful error message', function () {
              const validationError = {
                message: 'The response was not valid.',
                errors: [
                  {
                    errorCode: 'type.openapi.responseValidation',
                    message: 'response should be null',
                  },
                ],
                actualResponse: {
                  status: 204,
                  body: 'invalid body (should be empty)',
                  text: undefined,
                },
              };
              const errorReport = util.inspect(validationError);
              const assertion = () => expect(res).to.satisfyApiSpec;
              expect(assertion).to.throw(`expected res to satisfy API spec:\n${errorReport}`);
            });

            it('passes when using .not', function () {
              expect(res).to.not.satisfyApiSpec;
            });
          });
          describe('nested res.body', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `${serverPath}/test/responseBody/empty`,
              },
              body: [{ nestedProperty: 'invalid body (should be empty)' }],
              text: 'body should be empty',
            };

            it('fails and outputs a useful error message', function () {
              const validationError = {
                message: 'The response was not valid.',
                errors: [
                  {
                    errorCode: 'type.openapi.responseValidation',
                    message: 'response should be null',
                  },
                ],
                actualResponse: {
                  status: 204,
                  body: [{ nestedProperty: 'invalid body (should be empty)' }],
                  text: 'body should be empty',
                },
              };
              const errorReport = util.inspect(validationError, { showHidden: false, depth: null });
              const assertion = () => expect(res).to.satisfyApiSpec;
              expect(assertion).to.throw(`expected res to satisfy API spec:\n${errorReport}`);
            });

            it('passes when using .not', function () {
              expect(res).to.not.satisfyApiSpec;
            });
          });
        });
      });
    });

    describe('when \'res\' matches NO responses defined in the API spec', function () {
      describe('res matches no paths', function () {
        const res = {
          status: 204,
          req: {
            method: 'GET',
            path: `${serverPath}/does/not/exist`,
          },
        };

        it('fails', function () {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw('No \'/does/not/exist\' path defined in OpenAPI spec');
        });

        it('fails when using .not', function () {
          const assertion = () => expect(res).to.not.satisfyApiSpec;
          expect(assertion).to.throw('No \'/does/not/exist\' path defined in OpenAPI spec');
        });
      });

      describe('res matches a path but none of its HTTP methods', function () {
        const res = {
          status: 204,
          req: {
            method: 'HEAD',
            path: `${serverPath}/test/HTTPMethod`,
          },
        };

        it('fails', function () {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw('No \'HEAD\' method defined for path \'/test/HTTPMethod\' in OpenAPI spec');
        });

        it('fails when using .not', function () {
          const assertion = () => expect(res).to.not.satisfyApiSpec;
          expect(assertion).to.throw('No \'HEAD\' method defined for path \'/test/HTTPMethod\' in OpenAPI spec');
        });
      });
    });
  });
}
