import chai from 'chai';
import path from 'path';

import {
  joinWithNewLines,
  str,
} from '../../../../../commonTestResources/utils';
import chaiResponseValidator from '../../..';

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid',
);
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

  describe(`expect(res).to.satisfyApiSpec (using an OpenAPI ${openApiVersion} spec)`, () => {
    before(() => {
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe("when 'res' is not a valid HTTP response object", () => {
      const res = {
        status: 204,
        body: "must have a 'path' property",
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(TypeError);
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(TypeError);
      });
    });

    describe("when 'res' matches a response defined in the API spec", () => {
      describe("'res' satisfies the spec", () => {
        describe('spec expects res.body to', () => {
          describe('be a string', () => {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: '/responseBody/string',
              },
              body: 'valid body (string)',
            };
            const responseDefinition =
              openApiVersion === 2
                ? // OpenAPI 2
                  {
                    200: {
                      description: 'Response body should be a string',
                      schema: { type: 'string' },
                    },
                  }
                : // OpenAPI 3
                  {
                    200: {
                      description: 'Response body should be a string',
                      content: {
                        'application/json': { schema: { type: 'string' } },
                      },
                    },
                  };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not and outputs a useful error message', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                joinWithNewLines(
                  `expected res not to satisfy API spec`,
                  `expected res not to satisfy the '200' response defined for endpoint 'GET /responseBody/string' in your API spec`,
                  `res contained: ${str({ body: 'valid body (string)' })}`,
                  `The '200' response defined for endpoint 'GET /responseBody/string' in API spec: ${str(
                    responseDefinition,
                  )}`,
                ),
              );
            });
          });

          describe('match a simple schema object (string)', () => {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: '/responseBody/referencesSchemaObject/simple',
              },
              body: 'valid body (string)',
            };
            const responseDefinition =
              openApiVersion === 2
                ? // OpenAPI 2
                  {
                    200: {
                      description:
                        'Response body references a simple schema object',
                      schema: { $ref: '#/definitions/StringSchema' },
                    },
                  }
                : // OpenAPI 3
                  {
                    200: {
                      description:
                        'Response body references a simple schema object',
                      content: {
                        'application/json': {
                          schema: { $ref: '#/components/schemas/StringSchema' },
                        },
                      },
                    },
                  };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not and outputs a useful error message', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                joinWithNewLines(
                  `expected res not to satisfy the '200' response defined for endpoint 'GET /responseBody/referencesSchemaObject/simple' in your API spec`,
                  `res contained: ${str({ body: 'valid body (string)' })}`,
                  `The '200' response defined for endpoint 'GET /responseBody/referencesSchemaObject/simple' in API spec: ${str(
                    responseDefinition,
                  )}`,
                ),
              );
            });
          });

          describe('be empty', () => {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/responseBody/empty',
              },
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '204' response defined for endpoint 'GET /responseBody/empty'",
              );
            });
          });

          describe('be a boolean', () => {
            const res = {
              status: 200,
              req: {
                method: 'GET',
                path: '/responseBody/boolean',
              },
              body: false,
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '200' response defined for endpoint 'GET /responseBody/boolean'",
              );
            });
          });

          describe('be an object with depth of over 2', () => {
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
                path: '/responseBody/object/depthOver2',
              },
              body: nestedObject,
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                `res contained: ${str({ body: nestedObject })}`,
              );
            });
          });
        });

        describe('res.req.path matches a response referencing a response definition', () => {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: '/responseReferencesResponseDefinitionObject',
            },
            body: 'valid body (string)',
          };

          it('passes', () => {
            expect(res).to.satisfyApiSpec;
          });

          it('fails when using .not', () => {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw(
              "expected res not to satisfy the '200' response defined for endpoint 'GET /responseReferencesResponseDefinitionObject",
            );
          });
        });

        describe('res.req.path matches a path with multiple defined responses', () => {
          describe('1st defined response', () => {
            const res = {
              status: 201,
              req: {
                method: 'GET',
                path: '/multipleResponsesDefined',
              },
              body: 'valid body (string)',
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '201' response defined for endpoint 'GET /multipleResponsesDefined'",
              );
            });
          });

          describe('2nd defined response', () => {
            const res = {
              status: 202,
              req: {
                method: 'GET',
                path: '/multipleResponsesDefined',
              },
              body: 123456, // valid body (integer)
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '202' response defined for endpoint 'GET /multipleResponsesDefined'",
              );
            });
          });

          describe('3rd defined response', () => {
            const res = {
              status: 203,
              req: {
                method: 'GET',
                path: '/multipleResponsesDefined',
              },
              // no body
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '203' response defined for endpoint 'GET /multipleResponsesDefined'",
              );
            });
          });
        });

        describe('res.req.path contains parameters', () => {
          describe('a query param', () => {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/queryParams?exampleQueryParam=foo',
              },
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '204' response defined for endpoint 'GET /queryParams'",
              );
            });
          });

          describe('multiple query params', () => {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `/queryParams?${'exampleQueryParam=foo'}&${'exampleQueryParam2=bar'}`,
              },
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '204' response defined for endpoint 'GET /queryParams'",
              );
            });
          });

          describe('a path param (primitive)', () => {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/pathParams/primitive/foo',
              },
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '204' response defined for endpoint 'GET /pathParams/primitive/{stringParam}'",
              );
            });
          });

          describe('a path param (array)', () => {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/pathParams/array/foo,bar',
              },
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '204' response defined for endpoint 'GET /pathParams/array/{arrayParam}'",
              );
            });
          });

          describe('multiple path params', () => {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/multiplePathParams/foo/bar',
              },
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '204' response defined for endpoint 'GET /multiplePathParams/{param1}/{param2}'",
              );
            });
          });

          describe('path and query params together', () => {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: `/pathAndQueryParams/${'foo'}?${'exampleQueryParam=bar'}`,
              },
            };

            it('passes', () => {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', () => {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw(
                "expected res not to satisfy the '204' response defined for endpoint 'GET /pathAndQueryParams/{examplePathParam}'",
              );
            });
          });
        });
      });

      describe("'res' does NOT satisfy the spec", () => {
        describe('wrong res.status', () => {
          const res = {
            status: 418,
            req: {
              method: 'GET',
              path: '/responseStatus',
            },
          };

          it('fails', () => {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw(
              joinWithNewLines(
                'expected res to satisfy API spec',
                "expected res to satisfy a '418' response defined for endpoint 'GET /responseStatus' in your API spec",
                "res had status '418', but your API spec has no '418' or 'default' response defined for endpoint 'GET /responseStatus'",
                "Response statuses found for endpoint 'GET /responseStatus' in API spec: 200, 204",
              ),
            );
          });

          it('passes when using .not', () => {
            expect(res).to.not.satisfyApiSpec;
          });
        });

        describe('res.status caught by default response', () => {
          const res = {
            status: 418,
            req: {
              method: 'GET',
              path: '/responseStatus/default',
            },
          };
          it('passes', () => {
            expect(res).to.satisfyApiSpec;
          });
          it('fails when using .not', () => {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw(
              joinWithNewLines(
                'expected res not to satisfy API spec',
                "expected res not to satisfy the '418' response defined for endpoint 'GET /responseStatus/default' in your API spec",
                'res contained: { body: undefined }',
                "The '418' response defined for endpoint 'GET /responseStatus/default' in API spec: { '418': { description: 'No response body' } }",
              ),
            );
          });
        });

        describe('wrong res.body (multiple errors)', () => {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path: '/responseBody/object/withMultipleProperties',
            },
            body: { property1: 123, property2: 123 },
          };
          const responseDefinition =
            openApiVersion === 2
              ? // OpenAPI 2
                {
                  200: {
                    description:
                      'Response body should be an object with multiple string properties',
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
              : // OpenAPI 3
                {
                  200: {
                    description:
                      'Response body should be an object with multiple string properties',
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

          it('fails and outputs a useful error message', () => {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw(
              joinWithNewLines(
                "expected res to satisfy the '200' response defined for endpoint 'GET /responseBody/object/withMultipleProperties' in your API spec",
                'res did not satisfy it because: property1 must be string, property2 must be string',
                `res contained: ${str({
                  body: { property1: 123, property2: 123 },
                })}`,
                `The '200' response defined for endpoint 'GET /responseBody/object/withMultipleProperties' in API spec: ${str(
                  responseDefinition,
                )}`,
              ),
            );
          });

          it('passes when using .not', () => {
            expect(res).to.not.satisfyApiSpec;
          });
        });
      });
    });

    describe("when 'res' matches NO responses defined in the API spec", () => {
      describe('res matches no paths', () => {
        const res = {
          status: 204,
          req: {
            method: 'GET',
            path: '/does/not/exist',
          },
        };

        it('fails', () => {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw(
            joinWithNewLines(
              "expected res to satisfy a '204' response defined for endpoint 'GET /does/not/exist' in your API spec",
              "res had request path '/does/not/exist', but your API spec has no matching path",
              'Paths found in API spec: /responseBody/string, /responseBody/boolean', // etc.
            ),
          );
        });

        it('passes when using .not', () => {
          expect(res).to.not.satisfyApiSpec;
        });
      });

      describe('res matches a path but none of its HTTP methods', () => {
        const res = {
          status: 204,
          req: {
            method: 'HEAD',
            path: '/HTTPMethod',
          },
        };

        it('fails', () => {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw(
            joinWithNewLines(
              'expected res to satisfy API spec',
              "expected res to satisfy a '204' response defined for endpoint 'HEAD /HTTPMethod' in your API spec",
              "res had request method 'HEAD', but your API spec has no 'HEAD' operation defined for path '/HTTPMethod'",
              "Request operations found for path '/HTTPMethod' in API spec: GET, POST",
            ),
          );
        });

        it('passes when using .not', () => {
          expect(res).to.not.satisfyApiSpec;
        });
      });

      describe('res matches a path with path params but none of its HTTP methods', () => {
        const res = {
          status: 204,
          req: {
            method: 'HEAD',
            path: '/pathParams/primitive/foo',
          },
        };

        it('fails', () => {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw(
            joinWithNewLines(
              "expected res to satisfy a '204' response defined for endpoint 'HEAD /pathParams/primitive/{stringParam}' in your API spec",
              "res had request method 'HEAD', but your API spec has no 'HEAD' operation defined for path '/pathParams/primitive/{stringParam}'",
              "Request operations found for path '/pathParams/primitive/{stringParam}' in API spec: GET",
            ),
          );
        });

        it('passes when using .not', () => {
          expect(res).to.not.satisfyApiSpec;
        });
      });
    });
  });
});
