// Type definitions for jest-openapi
// Project: https://github.com/RuntimeTools/OpenAPIValidators/jest-openapi
// Definitions by: Richard Waller <https://github.com/rwalle61>
// TypeScript Version: 3.1

/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Check the HTTP response object satisfies a response defined in your OpenAPI spec.
       * [See usage example](https://github.com/RuntimeTools/OpenAPIValidators/jest-openapi#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)
       */
      toSatisfyApiSpec(): R;
      /**
       * Check the object satisfies a schema defined in your OpenAPI spec.
       * [See usage example](https://github.com/RuntimeTools/OpenAPIValidators/jest-openapi#in-unit-tests-validate-objects-against-schemas-defined-in-your-openapi-spec)
       */
      toSatisfySchemaInApiSpec(schemaName: string): R;
    }
  }
}

declare function jestOpenAPI(filepathOrObject: string|object): void;
export = jestOpenAPI;
