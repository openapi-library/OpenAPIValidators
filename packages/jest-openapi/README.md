# jest-openapi

[![downloads](https://img.shields.io/npm/dm/jest-openapi)](https://www.npmjs.com/package/jest-openapi)
[![npm](https://img.shields.io/npm/v/jest-openapi.svg)](https://www.npmjs.com/package/jest-openapi)
![build status](https://github.com/openapi-library/OpenAPIValidators/actions/workflows/ci.yml/badge.svg)
![style](https://img.shields.io/badge/code%20style-airbnb-ff5a5f.svg)
[![codecov](https://codecov.io/gh/openapi-library/OpenAPIValidators/branch/master/graph/badge.svg)](https://codecov.io/gh/openapi-library/OpenAPIValidators)
[![included](https://badgen.net/npm/types/jest-openapi)](https://github.com/openapi-library/OpenAPIValidators/blob/master/packages/jest-openapi/src/index.ts)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/openapi-library/OpenAPIValidators/blob/master/CONTRIBUTING.md)

Additional Jest matchers for asserting that HTTP responses satisfy an OpenAPI spec.

## Problem 😕

If your server's behaviour doesn't match your API documentation, then you need to correct your server, your documentation, or both. The sooner you know the better.

## Solution 😄

This plugin lets you automatically test whether your server's behaviour and documentation match. It adds Jest matchers that support the [OpenAPI standard](https://swagger.io/docs/specification/about/) for documenting REST APIs. In your JavaScript tests, you can simply assert [`expect(responseObject).toSatisfyApiSpec()`](#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)

Features:

- Validates the status and body of HTTP responses against your OpenAPI spec [(see example)](#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)
- Validates objects against schemas defined in your OpenAPI spec [(see example)](#in-unit-tests-validate-objects-against-schemas-defined-in-your-OpenAPI-spec)
- Load your OpenAPI spec just once in your tests (load from a filepath or object)
- Supports OpenAPI [2](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) and [3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
- Supports OpenAPI specs in YAML and JSON formats
- Supports `$ref` in response definitions (i.e. `$ref: '#/definitions/ComponentType/ComponentName'`)
- Informs you if your OpenAPI spec is invalid
- Supports responses from `axios`, `request-promise`, `supertest`, `superagent`, and `chai-http`
- Use in [Jest](#usage), or use our [sister package](https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/chai-openapi-response-validator#readme) for Mocha and other test runners that support Chai

## Contributing ✨

If you've come here to help contribute - thanks! Take a look at the [contributing](https://github.com/openapi-library/OpenAPIValidators/blob/master/CONTRIBUTING.md) docs to get started.

## Installation

[npm](http://npmjs.org)

```bash
npm install --save-dev jest-openapi
```

[yarn](https://yarnpkg.com/)

```bash
yarn add --dev jest-openapi
```

## Importing

ES6 / TypeScript

```typescript
import jestOpenAPI from 'jest-openapi';
```

CommonJS / JavaScript

```javascript
const jestOpenAPI = require('jest-openapi').default;
```

## Usage

### In API tests, validate the status and body of HTTP responses against your OpenAPI spec:

#### 1. Write a test:

```javascript
// Import this plugin
import jestOpenAPI from 'jest-openapi';

// Load an OpenAPI file (YAML or JSON) into this plugin
jestOpenAPI('path/to/openapi.yml');

// Write your test
describe('GET /example/endpoint', () => {
  it('should satisfy OpenAPI spec', async () => {
    // Get an HTTP response from your server (e.g. using axios)
    const res = await axios.get('http://localhost:3000/example/endpoint');

    expect(res.status).toEqual(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).toSatisfyApiSpec();
  });
});
```

#### 2. Write an OpenAPI Spec (and save to `path/to/openapi.yml`):

```yaml
openapi: 3.0.0
info:
  title: Example API
  version: 1.0.0
paths:
  /example:
    get:
      responses:
        200:
          description: Response body should be an object with fields 'stringProperty' and 'integerProperty'
          content:
            application/json:
              schema:
                type: object
                required:
                  - stringProperty
                  - integerProperty
                properties:
                  stringProperty:
                    type: string
                  integerProperty:
                    type: integer
```

#### 3. Run your test to validate your server's response against your OpenAPI spec:

##### The assertion passes if the response status and body satisfy `openapi.yml`:

```javascript
// Response includes:
{
  status: 200,
  body: {
    stringProperty: 'string',
    integerProperty: 123,
  },
};
```

##### The assertion fails if the response body is invalid:

```javascript
// Response includes:
{
  status: 200,
  body: {
    stringProperty: 'string',
    integerProperty: 'invalid (should be an integer)',
  },
};
```

###### Output from test failure:

```javascript
expect(received).toSatisfyApiSpec() // Matches 'received' to a response defined in your API spec, then validates 'received' against it

expected received to satisfy the '200' response defined for endpoint 'GET /example/endpoint' in your API spec
received did not satisfy it because: integerProperty should be integer

received contained: {
  body: {
      stringProperty: 'string',
      integerProperty: 'invalid (should be an integer)'
    }
  }
}

The '200' response defined for endpoint 'GET /example/endpoint' in API spec: {
  '200': {
    description: 'Response body should be a string',
    content: {
      'application/json': {
        schema: {
          type: 'string'
        }
      }
    }
  },
}
```

### In unit tests, validate objects against schemas defined in your OpenAPI spec:

#### 1. Write a test:

```javascript
// Import this plugin and the function you want to test
import jestOpenAPI from 'jest-openapi';
import { functionToTest } from 'path/to/your/code';

// Load an OpenAPI file (YAML or JSON) into this plugin
jestOpenAPI('path/to/openapi.yml');

// Write your test
describe('functionToTest()', () => {
  it('should satisfy OpenAPI spec', async () => {
    // Assert that the function returns a value satisfying a schema defined in your OpenAPI spec
    expect(functionToTest()).toSatisfySchemaInApiSpec('ExampleSchemaObject');
  });
});
```

#### 2. Write an OpenAPI Spec (and save to `path/to/openapi.yml`):

```yaml
openapi: 3.0.0
info:
  title: Example API
  version: 1.0.0
paths:
  /example:
    get:
      responses:
        200:
          description: Response body should be an ExampleSchemaObject
          content:
            application/json:
              schema: '#/components/schemas/ExampleSchemaObject'
components:
  schemas:
    ExampleSchemaObject:
      type: object
      required:
        - stringProperty
        - integerProperty
      properties:
        stringProperty:
          type: string
        integerProperty:
          type: integer
```

#### 3. Run your test to validate your object against your OpenAPI spec:

##### The assertion passes if the object satisfies the schema `ExampleSchemaObject`:

```javascript
// object includes:
{
  stringProperty: 'string',
  integerProperty: 123,
};
```

##### The assertion fails if the object does not satisfy the schema `ExampleSchemaObject`:

```javascript
// object includes:
{
  stringProperty: 123,
  integerProperty: 123,
};
```

###### Output from test failure:

```javascript
expect(received).not.toSatisfySchemaInApiSpec(schemaName) // Matches 'received' to a schema defined in your API spec, then validates 'received' against it

expected received to satisfy the 'StringSchema' schema defined in your API spec
object did not satisfy it because: stringProperty should be string

object was: {
    {
      stringProperty: 123,
      integerProperty: 123
    }
  }
}

The 'ExampleSchemaObject' schema in API spec: {
  type: 'object',
  required: [
    'stringProperty'
    'integerProperty'
  ],
  properties: {
    stringProperty: {
      type: 'string'
    },
    integerProperty: {
      type: 'integer'
    }
  }
}
```

### Loading your OpenAPI spec (3 different ways):

#### 1. From an absolute filepath ([see above](#usage))

#### 2. From an object:

```javascript
// Import this plugin
import jestOpenAPI from 'jest-openapi';

// Get an object representing your OpenAPI spec
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Example API',
    version: '0.1.0',
  },
  paths: {
    '/example/endpoint': {
      get: {
        responses: {
          200: {
            description: 'Response body should be a string',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};

// Load that OpenAPI object into this plugin
jestOpenAPI(openApiSpec);

// Write your test
describe('GET /example/endpoint', () => {
  it('should satisfy OpenAPI spec', async () => {
    // Get an HTTP response from your server (e.g. using axios)
    const res = await axios.get('http://localhost:3000/example/endpoint');

    expect(res.status).toEqual(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).toSatisfyApiSpec();
  });
});
```

#### 3. From a web endpoint:

```javascript
// Import this plugin and an HTTP client (e.g. axios)
import jestOpenAPI from 'jest-openapi';
import axios from 'axios';

// Write your test
describe('GET /example/endpoint', () => {
  // Load your OpenAPI spec from a web endpoint
  beforeAll(async () => {
    const response = await axios.get('url/to/openapi/spec');
    const openApiSpec = response.data; // e.g. { openapi: '3.0.0', ... };
    jestOpenAPI(openApiSpec);
  });

  it('should satisfy OpenAPI spec', async () => {
    // Get an HTTP response from your server
    const res = await axios.get('http://localhost:3000/example/endpoint');

    expect(res.status).toEqual(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).toSatisfyApiSpec();
  });
});
```
