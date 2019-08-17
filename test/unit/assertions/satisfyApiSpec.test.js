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
  describe(`expect(res).to.satisfyApiSpec (using an OpenAPI ${openApiVersion} spec)`, function () {
    before(function() {
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
                path: '/test/responseBody',
              },
              body: 'valid body (string)',
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'200\' response defined for endpoint \'GET /test/responseBody\' in OpenAPI spec');
            });
          });

          describe('match a (string) schema', function () {
            const res = {
              status: 201,
              req: {
                method: 'GET',
                path: '/test/responseBody',
              },
              body: 'valid body (string)',
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'201\' response defined for endpoint \'GET /test/responseBody\' in OpenAPI spec');
            });
          });

          describe('be empty', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/test/responseBody',
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/responseBody\' in OpenAPI spec');
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
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/queryParams\' in OpenAPI spec');
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
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/queryParams\' in OpenAPI spec');
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
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/pathParams/{exampleParam}\' in OpenAPI spec');
            });
          });

          describe('multiple path params', function () {
            const res = {
              status: 204,
              req: {
                method: 'GET',
                path: '/test/multiplePathParams/foo/and/bar',
              },
            };

            it('passes', function () {
              expect(res).to.satisfyApiSpec;
            });

            it('fails when using .not', function () {
              const assertion = () => expect(res).to.not.satisfyApiSpec;
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/multiplePathParams/{param1}/and/{param2}\' in OpenAPI spec');
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
              expect(assertion).to.throw('expected res not to satisfy API spec for \'204\' response defined for endpoint \'GET /test/pathAndQueryParams/{examplePathParam}\' in OpenAPI spec');
            });
          });
        });
      });

      describe('\'res\' does NOT satisfy the spec', function () {
        describe('spec expects a different res.status', function () {
          const res = {
            status: 418,
            req: {
              method: 'GET',
              path: '/test/miscellaneous',
            },
          };

          it('fails', function () {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw('No \'418\' response defined for endpoint \'GET /test/miscellaneous\' in OpenAPI spec');
          });

          it('fails when using .not', function () {
            const assertion = () => expect(res).not.to.satisfyApiSpec;
            expect(assertion).to.throw('No \'418\' response defined for endpoint \'GET /test/miscellaneous\' in OpenAPI spec');
          });
        });

        describe('spec expects a different res.body', function () {
          const res = {
            status: 204,
            req: {
              method: 'GET',
              path: '/test/responseBody',
            },
            body: 'invalid body (should be empty)',
          };

          it('fails', function () {
            const assertion = () => expect(res).to.satisfyApiSpec;
            expect(assertion).to.throw('The response was not valid');
          });

          it('passes when using .not', function () {
            expect(res).to.not.satisfyApiSpec;
          });
        });
      });
    });

    describe('when \'res\' does NOT match any responses defined in the API spec', function () {
      describe('no route defined', function () {
        const res = {
          status: 204,
          req: {
            method: 'GET',
            path: '/does/not/exist',
          },
        };

        it('fails', function () {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw('No \'/does/not/exist\' route defined in OpenAPI spec');
        });

        it('fails when using .not', function () {
          const assertion = () => expect(res).to.not.satisfyApiSpec;
          expect(assertion).to.throw('No \'/does/not/exist\' route defined in OpenAPI spec');
        });
      });

      describe('no HTTP method defined for endpoint', function () {
        const res = {
          status: 204,
          req: {
            method: 'HEAD',
            path: '/test/miscellaneous',
          },
        };

        it('fails', function () {
          const assertion = () => expect(res).to.satisfyApiSpec;
          expect(assertion).to.throw('No \'HEAD\' method defined for route \'/test/miscellaneous\' in OpenAPI spec');
        });

        it('fails when using .not', function () {
          const assertion = () => expect(res).to.not.satisfyApiSpec;
          expect(assertion).to.throw('No \'HEAD\' method defined for route \'/test/miscellaneous\' in OpenAPI spec');
        });
      });
    });
  });

}
