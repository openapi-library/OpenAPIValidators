# Chai OpenAPI Response Validator

[![downloads](https://img.shields.io/npm/dm/chai-openapi-response-validator)](https://www.npmjs.com/package/chai-openapi-response-validator)
[![npm](https://img.shields.io/npm/v/chai-openapi-response-validator.svg)](https://www.npmjs.com/package/chai-openapi-response-validator)
![build status](https://github.com/openapi-library/OpenAPIValidators/actions/workflows/ci.yml/badge.svg)
![style](https://img.shields.io/badge/code%20style-airbnb-ff5a5f.svg)
[![codecov](https://codecov.io/gh/openapi-library/OpenAPIValidators/branch/master/graph/badge.svg)](https://codecov.io/gh/openapi-library/OpenAPIValidators)
[![included](https://badgen.net/npm/types/chai-openapi-response-validator)](https://github.com/openapi-library/OpenAPIValidators/blob/master/packages/chai-openapi-response-validator/lib/index.ts)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/openapi-library/OpenAPIValidators/blob/master/CONTRIBUTING.md)

Use Chai to assert that HTTP responses satisfy an OpenAPI spec.

## Problem 😕

If your server's behaviour doesn't match your API documentation, then you need to correct your server, your documentation, or both. The sooner you know the better.

## Solution 😄

This plugin lets you automatically test whether your server's behaviour and documentation match. It extends the [Chai Assertion Library](https://www.chaijs.com/) to support the [OpenAPI standard](https://swagger.io/docs/specification/about/) for documenting REST APIs. In your JavaScript tests, you can simply assert [`expect(responseObject).to.satisfyApiSpec`](#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)

Features:

- Validates the status and body of HTTP responses against your OpenAPI spec [(see example)](#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)
- Validates objects against schemas defined in your OpenAPI spec [(see example)](#in-unit-tests-validate-objects-against-schemas-defined-in-your-OpenAPI-spec)
- Load your OpenAPI spec just once in your tests (load from a filepath or object)
- Supports OpenAPI [2](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) and [3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
- Supports OpenAPI specs in YAML and JSON formats
- Supports `$ref` in response definitions (i.e. `$ref: '#/definitions/ComponentType/ComponentName'`)
- Informs you if your OpenAPI spec is invalid
- Supports responses from `axios`, `request-promise`, `supertest`, `superagent`, and `chai-http`
- Use in [Mocha](#usage) and other test runners

## Contributing ✨

If you've come here to help contribute - thanks! Take a look at the [contributing](https://github.com/openapi-library/OpenAPIValidators/blob/master/CONTRIBUTING.md) docs to get started.

## Installation

[npm](http://npmjs.org)

```bash
npm install --save-dev chai-openapi-response-validator
```

[yarn](https://yarnpkg.com/)

```bash
yarn add --dev chai-openapi-response-validator
```

## Importing

ES6 / TypeScript

```typescript
import chaiResponseValidator from 'chai-openapi-response-validator';
```

CommonJS / JavaScript

<!-- prettier-ignore -->
```javascript
const chaiResponseValidator = require('chai-openapi-response-validator').default;
```

## Usage

### In API tests, validate the status and body of HTTP responses against your OpenAPI spec:

#### 1. Write a test:

```javascript
// Set up Chai
import chai from 'chai';
const expect = chai.expect;

// Import this plugin
import chaiResponseValidator from 'chai-openapi-response-validator';

// Load an OpenAPI file (YAML or JSON) into this plugin
chai.use(chaiResponseValidator('path/to/openapi.yml'));

// Write your test (e.g. using Mocha)
describe('GET /example/endpoint', () => {
  it('should satisfy OpenAPI spec', async () => {
    // Get an HTTP response from your server (e.g. using axios)
    const res = await axios.get('http://localhost:3000/example/endpoint');

    expect(res.status).to.equal(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).to.satisfyApiSpec;
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
AssertionError: expected res to satisfy API spec

expected res to satisfy the '200' response defined for endpoint 'GET /example/endpoint' in your API spec
res did not satisfy it because: integerProperty should be integer

res contained: {
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
// Set up Chai
import chai from 'chai';
const expect = chai.expect;

// Import this plugin and the function you want to test
import chaiResponseValidator from 'chai-openapi-response-validator';
import { functionToTest } from 'path/to/your/code';

// Load an OpenAPI file (YAML or JSON) into this plugin
chai.use(chaiResponseValidator('path/to/openapi.yml'));

// Write your test (e.g. using Mocha)
describe('functionToTest()', () => {
  it('should satisfy OpenAPI spec', async () => {
    // Assert that the function returns a value satisfying a schema defined in your OpenAPI spec
    expect(functionToTest()).to.satisfySchemaInApiSpec('ExampleSchemaObject');
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
AssertionError: expected object to satisfy schema 'ExampleSchemaObject' defined in API spec:
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
// Set up Chai
import chai from 'chai';
const expect = chai.expect;

// Import this plugin
import chaiResponseValidator from 'chai-openapi-response-validator';

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
chai.use(chaiResponseValidator(openApiSpec));

// Write your test (e.g. using Mocha)
describe('GET /example/endpoint', () => {
  it('should satisfy OpenAPI spec', async () => {
    // Get an HTTP response from your server (e.g. using axios)
    const res = await axios.get('http://localhost:3000/example/endpoint');

    expect(res.status).to.equal(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).to.satisfyApiSpec;
  });
});
```

#### 3. From a web endpoint:

```javascript
// Set up Chai
import chai from 'chai';
const expect = chai.expect;

// Import this plugin and an HTTP client (e.g. axios)
import chaiResponseValidator from 'chai-openapi-response-validator';
import axios from 'axios';

// Write your test (e.g. using Mocha)
describe('GET /example/endpoint', () => {
  // Load your OpenAPI spec from a web endpoint
  before(async () => {
    const response = await axios.get('url/to/openapi/spec');
    const openApiSpec = response.data; // e.g. { openapi: '3.0.0', <etc> };
    chai.use(chaiResponseValidator(openApiSpec));
  });

  it('should satisfy OpenAPI spec', async () => {
    // Get an HTTP response from your server (e.g. using axios)
    const res = await axios.get('http://localhost:3000/example/endpoint');

    expect(res.status).to.equal(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).to.satisfyApiSpec;
  });
});
```
