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
const chaiAsPromised = require('chai-as-promised');
const path = require('path');
const util = require('util');

const chaiHttp = require('chai-http');
const axios = require('axios');
const supertest = require('supertest');
const requestPromise = require('request-promise');

const chaiResponseValidator = require('../../../..');
const app = require('../../../resources/exampleApp');
const { port } = require('../../../config');

const appOrigin = `http://localhost:${port}`;
const pathToApiSpec = path.resolve('test/resources/exampleOpenApiFiles/valid/openapi3.yml');
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Parsing responses from different request modules', function () {

  before(function() {
    chai.use(chaiResponseValidator(pathToApiSpec));
  });

  describe('chai-http', function() {
    chai.use(chaiHttp);

    describe('res header is application/json, and res.body is a string', function() {
      const res = chai.request(app).get('/test/header/application/json/and/responseBody/string');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/string' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is {}', function() {
      const res = chai.request(app).get('/test/header/application/json/and/responseBody/emptyObject');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/emptyObject' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: {},
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is a boolean (false)', function() {
      const res = chai.request(app).get('/test/header/application/json/and/responseBody/boolean');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/boolean' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: false,
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function() {
      const res = chai.request(app).get('/test/header/application/json/and/responseBody/nullable');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/nullable' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: null,
            })
          }`
        );
      });
    });

    describe('res header is text/html, res.body is {}, and res.text is a string', function() {
      const res = chai.request(app).get('/test/header/text/html');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/text/html' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: {},
              text: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res has no content-type header, res.body is {}, and res.text is empty string', function() {
      const res = chai.request(app).get('/test/no/content-type/header/and/no/response/body');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '204' response defined for endpoint 'GET /test/no/content-type/header/and/no/response/body' in OpenAPI spec\nres: ${
            util.inspect({
              status: 204,
              body: {},
              text: '',
            })
          }`
        );
      });
    });

  });

  describe('supertest', function() {

    describe('res header is application/json, and res.body is a string', function() {
      const res = supertest(app).get('/test/header/application/json/and/responseBody/string');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/string' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is {}', function() {
      const res = supertest(app).get('/test/header/application/json/and/responseBody/emptyObject');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/emptyObject' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: {},
            })
          }`
        );
      });
    });

    describe('res header is text/html, res.body is {}, and res.text is a string', function() {
      const res = supertest(app).get('/test/header/text/html');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/text/html' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: {},
              text: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function() {
      const res = supertest(app).get('/test/header/application/json/and/responseBody/nullable');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/nullable' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: null,
            })
          }`
        );
      });
    });

    describe('res has no content-type header, res.body is {}, and res.text is empty string', function() {
      const res = supertest(app).get('/test/no/content-type/header/and/no/response/body');
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '204' response defined for endpoint 'GET /test/no/content-type/header/and/no/response/body' in OpenAPI spec\nres: ${
            util.inspect({
              status: 204,
              body: {},
              text: '',
            })
          }`
        );
      });
    });

  });

  describe('axios', function() {

    describe('res header is application/json, and res.body is a string', function() {
      const res = axios.get(`${appOrigin}/test/header/application/json/and/responseBody/string`);
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/string' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is {}', function() {
      const res = axios.get(`${appOrigin}/test/header/application/json/and/responseBody/emptyObject`);
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/emptyObject' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: {},
            })
          }`
        );
      });
    });

    describe('res header is text/html, res.body is a string', function() {
      const res = axios.get(`${appOrigin}/test/header/text/html`);
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/text/html' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function() {
      const res = axios.get(`${appOrigin}/test/header/application/json/and/responseBody/nullable`);
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/nullable' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: null,
            })
          }`
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', function() {
      const res = axios.get(`${appOrigin}/test/no/content-type/header/and/no/response/body`);
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '204' response defined for endpoint 'GET /test/no/content-type/header/and/no/response/body' in OpenAPI spec\nres: ${
            util.inspect({
              status: 204,
              body: '',
            })
          }`
        );
      });
    });

  });

  describe('request-promise', function() {
    describe('res header is application/json, and res.body is a string', function() {
      const res = requestPromise({
        method: 'GET',
        uri: `${appOrigin}/test/header/application/json/and/responseBody/string`,
        resolveWithFullResponse: true,
      });
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/string' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is \'{}\'', function() {
      const res = requestPromise({
        method: 'GET',
        uri: `${appOrigin}/test/header/application/json/and/responseBody/emptyObject`,
        resolveWithFullResponse: true,
      });
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/emptyObject' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: '{}',
            })
          }`
        );
      });
    });

    describe('res header is text/html, res.body is a string', function() {
      const res = requestPromise({
        method: 'GET',
        uri: `${appOrigin}/test/header/text/html`,
        resolveWithFullResponse: true,
      });
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/text/html' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'res.body is a string',
            })
          }`
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function() {
      const res = requestPromise({
        method: 'GET',
        uri: `${appOrigin}/test/header/application/json/and/responseBody/nullable`,
        resolveWithFullResponse: true,
      });
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/header/application/json/and/responseBody/nullable' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'null',
            })
          }`
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', function() {
      const res = requestPromise({
        method: 'GET',
        uri: `${appOrigin}/test/no/content-type/header/and/no/response/body`,
        resolveWithFullResponse: true,
      });
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '204' response defined for endpoint 'GET /test/no/content-type/header/and/no/response/body' in OpenAPI spec\nres: ${
            util.inspect({
              status: 204,
              body: '',
            })
          }`
        );
      });
    });

  });

});
