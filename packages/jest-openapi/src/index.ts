import { makeApiSpec, OpenAPISpecObject } from 'openapi-validator';
import toSatisfyApiSpec from './matchers/toSatisfyApiSpec';
import toSatisfySchemaInApiSpec from './matchers/toSatisfySchemaInApiSpec';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      /**
       * Check the HTTP response object satisfies a response defined in your OpenAPI spec.
       * [See usage example](https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)
       */
      toSatisfyApiSpec(): R;
      /**
       * Check the object satisfies a schema defined in your OpenAPI spec.
       * [See usage example](https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi#in-unit-tests-validate-objects-against-schemas-defined-in-your-openapi-spec)
       */
      toSatisfySchemaInApiSpec(schemaName: string): R;
    }
  }
}

export default function (filepathOrObject: string | OpenAPISpecObject): void {
  const openApiSpec = makeApiSpec(filepathOrObject);

  const jestMatchers: jest.ExpectExtendMap = {
    toSatisfyApiSpec(received: unknown) {
      return toSatisfyApiSpec.call(this, received, openApiSpec);
    },
    toSatisfySchemaInApiSpec(received: unknown, schemaName: string) {
      return toSatisfySchemaInApiSpec.call(
        this,
        received,
        schemaName,
        openApiSpec,
      );
    },
  };

  const jestExpect = (global as { expect?: jest.Expect }).expect;

  /* istanbul ignore next */
  if (jestExpect !== undefined) {
    jestExpect.extend(jestMatchers);
  } else {
    // eslint-disable-next-line no-console
    console.error(
      [
        "Unable to find Jest's global expect.",
        'Please check you have configured jest-openapi correctly.',
        'See https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi#usage for help.',
      ].join('\n'),
    );
  }
  /* istanbul ignore next */
}
