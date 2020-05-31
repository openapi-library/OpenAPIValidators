/** *****************************************************************************
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
 ****************************************************************************** */

const chai = require('chai');
const path = require('path');
const util = require('util');
const { c } = require('compress-tag');

const chaiResponseValidator = require('../../..');

const str = (obj) => util.inspect(obj, { showHidden: false, depth: null });
const openApiSpecsDir = path.resolve('../../commonTestResources/exampleOpenApiFiles/valid');
const openApiSpecs = [
  {
    openApiVersion: 2,
    pathToApiSpec: path.join(openApiSpecsDir, 'openapi2.json'),
  },
  {
    openApiVersion: 3,
    pathToApiSpec: path.join(openApiSpecsDir, 'openapi3.yml'),
  },
];
const { expect } = chai;

openApiSpecs.forEach((spec) => {
  const { openApiVersion, pathToApiSpec } = spec;

  describe(`expect(res).to.satisfyApiSpec (using an OpenAPI ${openApiVersion} spec)`, function () {
    before(function () {
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('when \'res\' is not a valid HTTP response object', function () {
      const res = {
        status: 204,
        body: 'should have a \'path\' property',
      };

      it('fails', function () {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(TypeError);
      });

      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(TypeError);
      });
    });

    describe('when \'res\' matches a response defined in the API spec', function () {
      describe('\'res\' satisfies the spec', function () {
        describe('spec expects res.body to', function () {
          describe('be a string', function () {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: '/test/responseBody/string',
              },
              body: 'valid body (string)',
            };
            const responseDefinition = openApiVersion === 2
              // OpenAPI 2
              ? {
                200: {
                  description: 'Response body should be a string',
                  schema: { type: 'string' },
                },
              }
              // OpenAPI 3
              : {
                200: {
                  description: 'Response body should be a string',
                  content: { 'application/json': { schema: { type: 'string' } } },
                },
              };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not and outputs a useful error message', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                c`expected res not to satisfy API spec
              \n\nexpected res not to satisfy the '200' response defined
                  for endpoint 'GET /test/responseBody/string' in your API spec
              \n\nres contained: ${str({ body: 'valid body (string)' })}
              \n\nThe '200' response defined for endpoint 'GET /test/responseBody/string' in API spec: ${str(responseDefinition)}`,
              );
            });
          });

          describe('match a simple schema object (string)', function () {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: '/test/responseBody/referencesSchemaObject/simple',
              },
              body: 'valid body (string)',
            };
            const responseDefinition = openApiVersion === 2
              // OpenAPI 2
              ? {
                200: {
                  description: 'Response body references a simple schema object',
                  schema: { $ref: '#/definitions/StringSchema' },
                },
              }
              // OpenAPI 3
              : {
                200: {
                  description: 'Response body references a simple schema object',
                  content: { 'application/json': { schema: { $ref: '#/components/schemas/StringSchema' } } },
                },
              };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not and outputs a useful error message', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                c`expected res not to satisfy API spec
              \n\nexpected res not to satisfy the '200' response defined
                  for endpoint 'GET /test/responseBody/referencesSchemaObject/simple' in your API spec
              \n\nres contained: ${str({ body: 'valid body (string)' })}
              \n\nThe '200' response defined for endpoint 'GET /test/responseBody/referencesSchemaObject/simple' in API spec: ${str(responseDefinition)}`,
              );
            });
          });

          describe('be empty', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/test/responseBody/empty',
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'204\' response defined for endpoint \'GET /test/responseBody/empty\'',
              );
            });
          });

          describe('be a boolean', function () {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: '/test/responseBody/boolean',
              },
              body: false,
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'200\' response defined for endpoint \'GET /test/responseBody/boolean\'',
              );
            });
          });

          describe('be an object with depth of over 2', function () {
            const nestedObject = {
              a: {
                b: {
                  c: 'valid string',
                },
              },
            };
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: '/test/responseBody/object/depthOver2',
              },
              body: nestedObject,
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                `res contained: ${str({ body: nestedObject })}`,
              );
            });
          });
        });

        describe('res.req.path matches a response referencing a response definition', function () {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: '/test/responseReferencesResponseDefinitionObject',
            },
            body: 'valid body (string)',
          };

          it('passes', function () {
            expect(res).to.satisfyApiSpec;
          });

          it('fails when using .not', function () {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw(
              'expected res not to satisfy the \'200\' response defined for endpoint \'GET /test/responseReferencesResponseDefinitionObject',
            );
          });
        });

        describe('res.req.path matches a path with multiple defined responses', function () {
          describe('1st defined response', function () {
            const res = {
              status: 201,
              req: {
                method: 'GET',
                path: '/test/multipleResponsesDefined',
              },
              body: 'valid body (string)',
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'201\' response defined for endpoint \'GET /test/multipleResponsesDefined\'',
              );
            });
          });

          describe('2nd defined response', function () {
            const res = {
              status: 202,
              req: {
                method: 'GET',
                path: '/test/multipleResponsesDefined',
              },
              body: 123456, // valid body (integer)
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'202\' response defined for endpoint \'GET /test/multipleResponsesDefined\'',
              );
            });
          });

          describe('3rd defined response', function () {
            const res = {
              status: 203,
              req: {
                method: 'GET',
                path: '/test/multipleResponsesDefined',
              },
              // no body
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'203\' response defined for endpoint \'GET /test/multipleResponsesDefined\'',
              );
            });
          });
        });

        describe('res.req.path contains parameters', function () {
          describe('a query param', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/test/queryParams?exampleQueryParam=foo',
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'204\' response defined for endpoint \'GET /test/queryParams\'',
              );
            });
          });

          describe('multiple query params', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `/test/queryParams?${'exampleQueryParam=foo'}&${'exampleQueryParam2=bar'}`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'204\' response defined for endpoint \'GET /test/queryParams\'',
              );
            });
          });

          describe('a path param', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/test/pathParams/foo',
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'204\' response defined for endpoint \'GET /test/pathParams/{exampleParam}\'',
              );
            });
          });

          describe('multiple path params', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/test/multiplePathParams/foo/bar',
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'204\' response defined for endpoint \'GET /test/multiplePathParams/{param1}/{param2}\'',
              );
            });
          });

          describe('path and query params together', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `/test/pathAndQueryParams/${'foo'}?${'exampleQueryParam=bar'}`,
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                'expected res not to satisfy the \'204\' response defined for endpoint \'GET /test/pathAndQueryParams/{examplePathParam}\'',
              );
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
              path: '/test/responseStatus',
            },
          };

          it('fails', function () {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw(
              c`expected res to satisfy API spec
            \n\nexpected res to satisfy a '418' response defined for endpoint 'GET /test/responseStatus' in your API spec
              \nres had status '418', but your API spec has no '418' response defined for endpoint 'GET /test/responseStatus'
            \n\nResponse statuses found for endpoint 'GET /test/responseStatus' in API spec: 200, 204`,
            );
          });

          it('passes when using .not', function () {
            expect(res).to.not.satisfyApiSpec;
          });
        });

        describe('wrong res.body (multiple errors)', function () {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: '/test/responseBody/object/withMultipleProperties',
            },
            body: { property1: 123, property2: 123 },
          };
          const responseDefinition = openApiVersion === 2
            // OpenAPI 2
            ? {
              200: {
                description: 'Response body should be an object with multiple string properties',
                schema: {
                  type: 'object',
                  required: ['property1', 'property2'],
                  properties: {
                    property1: { type: 'string' },
                    property2: { type: 'string' },
                  },
                },
              },
            }
            // OpenAPI 3
            : {
              200: {
                description: 'Response body should be an object with multiple string properties',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['property1', 'property2'],
                      properties: {
                        property1: { type: 'string' },
                        property2: { type: 'string' },
                      },
                    },
                  },
                },
              },
            };

          it('fails and outputs a useful error message', function () {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw(
              c`expected res to satisfy API spec
            \n\nexpected res to satisfy the '200' response defined
                for endpoint 'GET /test/responseBody/object/withMultipleProperties' in your API spec
              \nres did not satisfy it because: property1 should be string, property2 should be string
            \n\nres contained: ${str({ body: { property1: 123, property2: 123 } })}
            \n\nThe '200' response defined for endpoint 'GET /test/responseBody/object/withMultipleProperties' in API spec: ${str(responseDefinition)}`,
            );
          });

          it('passes when using .not', function () {
            expect(res).to.not.satisfyApiSpec;
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
            path: '/does/not/exist',
          },
        };

        it('fails', function () {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw(
            'expected res to satisfy a \'204\' response defined for endpoint \'GET /does/not/exist\' in your API spec'
          + '\nres had request path \'/does/not/exist\', but your API spec has no matching path'
          + '\n\nPaths found in API spec: /test/responseBody/string, /test/responseBody/boolean', // etc.
          );
        });

        it('passes when using .not', function () {
          expect(res).to.not.satisfyApiSpec;
        });
      });

      describe('res matches a path but none of its HTTP methods', function () {
        const res = {
          status: 204,
          req: {
            method: 'HEAD',
            path: '/test/HTTPMethod',
          },
        };

        it('fails', function () {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw(
            c`expected res to satisfy API spec
          \n\nexpected res to satisfy a '204' response defined for endpoint 'HEAD /test/HTTPMethod' in your API spec
            \nres had request method 'HEAD', but your API spec has no 'HEAD' operation defined for path '/test/HTTPMethod'
          \n\nRequest operations found for path '/test/HTTPMethod' in API spec: GET, POST`,
          );
        });

        it('passes when using .not', function () {
          expect(res).to.not.satisfyApiSpec;
        });
      });

      describe('res matches a path with path params but none of its HTTP methods', function () {
        const res = {
          status: 204,
          req: {
            method: 'HEAD',
            path: '/test/pathParams/someParam',
          },
        };

        it('fails', function () {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw(
            c`expected res to satisfy API spec
          \n\nexpected res to satisfy a '204' response defined for endpoint 'HEAD /test/pathParams/{exampleParam}' in your API spec
            \nres had request method 'HEAD', but your API spec has no 'HEAD' operation defined for path '/test/pathParams/{exampleParam}'
          \n\nRequest operations found for path '/test/pathParams/{exampleParam}' in API spec: GET`,
          );
        });

        it('passes when using .not', function () {
          expect(res).to.not.satisfyApiSpec;
        });
      });
    });
  });
});
