# Chai OpenAPI Response Validator

[![downloads](https://img.shields.io/npm/dm/chai-openapi-response-validator)](https://www.npmjs.com/package/chai-openapi-response-validator)
[![npm](https://img.shields.io/npm/v/chai-openapi-response-validator.svg)](https://www.npmjs.com/package/chai-openapi-response-validator)
[![Build Status](https://travis-ci.com/RuntimeTools/chai-openapi-response-validator.svg?branch=master)](https://travis-ci.com/RuntimeTools/chai-openapi-response-validator)
![dependencies](https://img.shields.io/david/RuntimeTools/chai-openapi-response-validator)

Simple Chai support for asserting that HTTP responses satisfy an OpenAPI spec.

## How does this help?

If your server's behaviour doesn't match your API documentation, then you need to correct your server, your documentation, or both. The sooner you know the better.

This plugin allows you to automatically test whether your server's behaviour and documentation match. It extends the [Chai Assertion Library](https://www.chaijs.com/) to support the [OpenAPI standard](https://swagger.io/docs/specification/about/) for documenting REST APIs.

## Features
- Validates the status and body of HTTP responses against an OpenAPI spec
- Easily load your OpenAPI spec just once in your tests
- Supports OpenAPI 2 and 3
- Supports OpenAPI specs in YAML and JSON formats
- Supports `$ref` in response schemas (i.e. `$ref: '#/definitions/ComponentType/ComponentName'`)
- Informs you if your OpenAPI spec is invalid
- Supports responses from `axios`, `request-promise`, `supertest`, `superagent`, and `chai-http`

## Installation
This is an addon plugin for the [Chai Assertion Library](http://chaijs.com). Install via [npm](http://npmjs.org).
```bash
$ npm install chai-openapi-response-validator
```

## Usage

### 1. Write a test:

```javascript
// Set up Chai
const chai = require('chai');
const expect = chai.expect;

// Import this plugin
const chaiResponseValidator = require('chai-openapi-response-validator');

// Load an OpenAPI file (YAML or JSON) into this plugin
chai.use(chaiResponseValidator('path/to/openapi.yml'));

// Write your test (e.g. using Mocha)
describe('GET /example/request', function() {
  it('should satisfy OpenAPI spec', async function() {

    // Get an HTTP response from your server (e.g. using axios)
    const res = await axios.get('http://localhost:3000/example/request');

    expect(res.status).to.equal(200);

    // Assert that the HTTP response satisfies the OpenAPI spec
    expect(res).to.satisfyApiSpec;
  });
});
```

### 2. Write an OpenAPI Spec (and save at `path/to/openapi.yml`):
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
          description: Response body should be a string
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

### 3. Run your test to validate your server's response against your OpenAPI spec:

#### The assertion passes if the response status and body satisfy `openapi.yml`:

```javascript
// Response includes:
{
  status: 200,
  body: {
    string: 'string',
    integer: 123,
  },
};
```


#### The assertion fails if the response body is invalid:

```javascript
// Response includes:
{
  status: 200,
  body: {
    string: 'string',
    integer: 'invalid (should be an integer)',
  },
};
```

Output from test failure:

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


## Contributing

Thank you very much for considering to contribute!

Please make sure you follow our [Code Of Conduct](https://github.com/openapi-chai/chai-openapi-response-validator/blob/master/CODE_OF_CONDUCT.md) and we also strongly recommend reading our [Contributing Guide](https://github.com/openapi-chai/chai-openapi-response-validator/blob/master/CONTRIBUTING.md).
