# Chai OpenAPI Response Validator

[![downloads](https://img.shields.io/npm/dm/chai-openapi-response-validator)](https://www.npmjs.com/package/chai-openapi-response-validator)
[![npm](https://img.shields.io/npm/v/chai-openapi-response-validator.svg)](https://www.npmjs.com/package/chai-openapi-response-validator)
[![Build Status](https://travis-ci.com/RuntimeTools/chai-openapi-response-validator.svg?branch=master)](https://travis-ci.com/RuntimeTools/chai-openapi-response-validator)
![dependencies](https://img.shields.io/david/RuntimeTools/chai-openapi-response-validator)
![style](https://img.shields.io/badge/code%20style-airbnb-ff5a5f.svg)

Simple Chai support for asserting that HTTP responses satisfy an OpenAPI spec.

## How does this help?

If your server's behaviour doesn't match your API documentation, then you need to correct your server, your documentation, or both. The sooner you know the better.

This plugin lets you automatically test whether your server's behaviour and documentation match. It extends the [Chai Assertion Library](https://www.chaijs.com/) to support the [OpenAPI standard](https://swagger.io/docs/specification/about/) for documenting REST APIs.

## Features
- Validates the status and body of HTTP responses against your OpenAPI spec [(see example)](#in-api-tests-validate-the-status-and-body-of-http-responses-against-your-openapi-spec)
- Validates objects against schemas defined in your OpenAPI spec [(see example)](#in-unit-tests-validate-objects-against-schemas-defined-in-your-OpenAPI-spec)
- Load your OpenAPI spec just once in your tests (load from a filepath or object)
- Supports OpenAPI [2](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) and [3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
- Supports OpenAPI specs in YAML and JSON formats
- Supports `$ref` in response definitions (i.e. `$ref: '#/definitions/ComponentType/ComponentName'`)
- Informs you if your OpenAPI spec is invalid
- Supports responses from `axios`, `request-promise`, `supertest`, `superagent`, and `chai-http`
- Bundled with a TypeScript Declaration File for [use in TypeScript projects](#using-this-plugin-in-a-typescript-project)

## Installation
This is an addon plugin for the [Chai Assertion Library](http://chaijs.com). Install via [npm](http://npmjs.org).
```bash
$ npm install --save-dev chai-openapi-response-validator
```

## Usage

### In API tests, validate the status and body of HTTP responses against your OpenAPI spec:

#### 1. Write a test:
```javascript
// Set up Chai
const chai = require('chai');
const expect = chai.expect;

// Import this plugin
const chaiResponseValidator = require('chai-openapi-response-validator');

// Load an OpenAPI file (YAML or JSON) into this plugin
chai.use(chaiResponseValidator('path/to/openapi.yml'));

// Write your test (e.g. using Mocha)
describe('GET /example/endpoint', function() {
  it('should satisfy OpenAPI spec', async function() {

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
AssertionError: expected res to satisfy API spec:
{
  message: 'The response was not valid.',
  errors: [
    {
      path: 'integerProperty',
      errorCode: 'type.openapi.responseValidation',
      message: 'integerProperty should be integer'
    }
  ],
  actualResponse: {
    status: 200,
    body: {
      stringProperty: 'string',
      integerProperty: 'invalid (should be an integer)'
    }
  }
}
```

### In unit tests, validate objects against schemas defined in your OpenAPI spec:
#### 1. Write a test:
```javascript
// Set up Chai
const chai = require('chai');
const expect = chai.expect;

// Import this plugin
const chaiResponseValidator = require('chai-openapi-response-validator');

// Load an OpenAPI file (YAML or JSON) into this plugin
chai.use(chaiResponseValidator('path/to/openapi.yml'));

// Write your test (e.g. using Mocha)
describe('myModule.getObject()', function() {
  it('should satisfy OpenAPI spec', async function() {
    // Run the function you want to test
    const myModule = require('path/to/your/module.js');
    const output = myModule.getObject();

    // Assert that the output satisfies a schema defined in your OpenAPI spec
    expect(output).to.satisfySchemaInApiSpec('ExampleSchemaObject');
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
{
  message: 'The object was not valid.',
  errors: [
    {
      errorCode: 'type.openapi.objectValidation',
      message: 'stringProperty should be string'
    }
  ],
  actualObject: {
    {
      stringProperty: 123,
      integerProperty: 123
    }
  }
}
```

### Loading your OpenAPI spec (3 different ways):

#### 1. From an absolute filepath ([see above](#usage))
#### 2. From an object:
```javascript
// Set up Chai
const chai = require('chai');
const expect = chai.expect;

// Import this plugin
const chaiResponseValidator = require('chai-openapi-response-validator');

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
          '200': {
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
describe('GET /example/endpoint', function() {
  it('should satisfy OpenAPI spec', async function() {

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
const chai = require('chai');
const expect = chai.expect;

// Import this plugin
const chaiResponseValidator = require('chai-openapi-response-validator');

// Write your test (e.g. using Mocha)
describe('GET /example/endpoint', function() {

  // Load your OpenAPI spec from a web endpoint
  before(async function() {
    const axios = require('axios');
    const response = await axios.get('url/to/openapi/spec');
    const openApiSpec = response.data; // e.g. { openapi: '3.0.0', <etc> };
    chai.use(chaiResponseValidator(openApiSpec));
  });

  it('should satisfy OpenAPI spec', async function() {

    // Get an HTTP response from your server (e.g. using axios)
    const res = await axios.get('http://localhost:3000/example/endpoint');

    expect(res.status).to.equal(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).to.satisfyApiSpec;
  });
});
```

### Using this plugin in a TypeScript project

#### Installation
You don't need to `npm install --save-dev @types/chai-openapi-response-validator` because we bundle our TypeScript Definition file into this package (see `index.d.ts`).

#### Importing
1. Make sure your `tsconfig.json` includes:
```javascript
{
  "compilerOptions": {
    esModuleInterop: true,
  }
}
```
2. Import like this:
```javascript
import chai from 'chai';
import chaiResponseValidator from 'chai-openapi-response-validator';
```


## Contributing

Thank you very much for considering to contribute!

Please make sure you follow our [Code Of Conduct](https://github.com/RuntimeTools/chai-openapi-response-validator/blob/master/CODE_OF_CONDUCT.md) and we also strongly recommend reading our [Contributing Guide](https://github.com/RuntimeTools/chai-openapi-response-validator/blob/master/CONTRIBUTING.md).
