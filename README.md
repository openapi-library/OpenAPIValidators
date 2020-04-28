# OpenAPI Validators

[![Build Status](https://travis-ci.com/RuntimeTools/OpenAPIValidators.svg?branch=master)](https://travis-ci.com/RuntimeTools/OpenAPIValidators)
![dependencies](https://img.shields.io/david/RuntimeTools/OpenAPIValidators)
![style](https://img.shields.io/badge/code%20style-airbnb-ff5a5f.svg)
[![codecov](https://codecov.io/gh/RuntimeTools/OpenAPIValidators/branch/master/graph/badge.svg)](https://codecov.io/gh/RuntimeTools/OpenAPIValidators)

Chai and Jest support for asserting that HTTP responses satisfy an OpenAPI spec.

## Problem

If your server's behaviour doesn't match your API documentation, then you need to correct your server, your documentation, or both. The sooner you know the better.

## Solution

These plugin let you automatically test whether your server's behaviour and documentation match. They extend Chai and Jest to support the [OpenAPI standard](https://swagger.io/docs/specification/about/) for documenting REST APIs. In your JavaScript tests, you can simply assert `expect(responseObject).toSatisfyApiSpec()`


### [Chai OpenAPI Response Validator](https://github.com/RuntimeTools/OpenAPIValidators/tree/master/packages/chai-openapi-response-validator#readme):

[![downloads](https://img.shields.io/npm/dm/chai-openapi-response-validator)](https://www.npmjs.com/package/chai-openapi-response-validator)
[![npm](https://img.shields.io/npm/v/chai-openapi-response-validator.svg)](https://www.npmjs.com/package/chai-openapi-response-validator)


### [jest-openapi](https://github.com/RuntimeTools/OpenAPIValidators/tree/master/packages/jest-openapi#readme)

[![downloads](https://img.shields.io/npm/dm/jest-openapi)](https://www.npmjs.com/package/jest-openapi)
[![npm](https://img.shields.io/npm/v/jest-openapi.svg)](https://www.npmjs.com/package/jest-openapi)
