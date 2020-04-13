// Type definitions for chai-openapi-response-validator 0.8.0
// Project: https://github.com/RuntimeTools/chai-openapi-response-validator
// Definitions by: Richard Waller <https://github.com/rwalle61>
// TypeScript Version: 3.0

/// <reference types="chai" />

declare global {
	namespace Chai {
		interface Assertion {
			/**
			 * Check the HTTP response object satisfies a response defined in your OpenAPI spec.
			 * [See usage example](https://github.com/RuntimeTools/chai-openapi-response-validator#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)
			 */
			satisfyApiSpec: Assertion;
			/**
			 * Check the object satisfies a schema defined in your OpenAPI spec.
			 * [See usage example](https://github.com/RuntimeTools/chai-openapi-response-validator#in-unit-tests-validate-objects-against-schemas-defined-in-your-openapi-spec)
			 */
			satisfySchemaInApiSpec(schemaName: string): Assertion;
		}
	}
}

declare function chaiResponseValidator(filepathOrObject: string|object): Chai.ChaiPlugin;
export = chaiResponseValidator;
