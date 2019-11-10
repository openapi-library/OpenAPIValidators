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

const chaiResponseValidator = require('../../..');
const app = require('../../resources/exampleApp');
const { port } = require('../../config');

const appOrigin = `http://localhost:${port}`;
const appPathToTest = '/local/test/responseBody/string';
const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/valid/openapi3.yml');
chai.use(chaiResponseValidator(pathToApiSpec));
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Parsing responses from different request modules', function () {

  describe('modules that differentiate between res.body and res.text', function() {

    describe('chai-http', function() {
      chai.use(chaiHttp);

      describe('res.body is a string', function() {
        const res = chai.request(app).get(appPathToTest);
        it('passes', async function() {
          expect(await res).to.satisfyApiSpec;
        });
        it('fails when using .not', function () {
          const assertion = async() => expect(await res).to.not.satisfyApiSpec;
          return expect(assertion()).to.be.rejectedWith(
            `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/responseBody/string' in OpenAPI spec\nres: ${
              util.inspect({
                status: 200,
                body: 'valid body (string)',
              })
            }`
          );
        });
      });

      describe('res.body is an empty object', function() {
        const res = chai.request(app).get('/local/test/responseBody/emptyObject');
        it('passes', async function() {
          expect(await res).to.satisfyApiSpec;
        });
        it('fails when using .not', function () {
          const assertion = async() => expect(await res).to.not.satisfyApiSpec;
          return expect(assertion()).to.be.rejectedWith(
            `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/responseBody/emptyObject' in OpenAPI spec\nres: ${
              util.inspect({
                status: 200,
                body: {},
                text: 'valid body (empty object)',
              })
            }`
          );
        });
      });

    });

    describe('supertest', function() {

      describe('res.body is a string', function() {
        const res = supertest(app).get(appPathToTest);
        it('passes', async function() {
          expect(await res).to.satisfyApiSpec;
        });
        it('fails when using .not', function () {
          const assertion = async() => expect(await res).to.not.satisfyApiSpec;
          return expect(assertion()).to.be.rejectedWith(
            `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/responseBody/string' in OpenAPI spec\nres: ${
              util.inspect({
                status: 200,
                body: 'valid body (string)',
              })
            }`
          );
        });
      });

      describe('res.body is an empty object', function() {
        const res = supertest(app).get('/local/test/responseBody/emptyObject');
        it('passes', async function() {
          expect(await res).to.satisfyApiSpec;
        });
        it('fails when using .not', function () {
          const assertion = async() => expect(await res).to.not.satisfyApiSpec;
          return expect(assertion()).to.be.rejectedWith(
            `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/responseBody/emptyObject' in OpenAPI spec\nres: ${
              util.inspect({
                status: 200,
                body: {},
                text: 'valid body (empty object)',
              })
            }`
          );
        });
      });

    });

  });

  describe('modules that don\'t differentiate between res.body and res.text', function() {

    describe('axios', function() {
      const res = axios.get(`${appOrigin}${appPathToTest}`);
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/responseBody/string' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'valid body (string)',
            })
          }`
        );
      });
    });

    describe('request-promise', function() {
      const res = requestPromise({
        method: 'GET',
        uri: `${appOrigin}${appPathToTest}`,
        resolveWithFullResponse: true,
      });
      it('passes', async function() {
        expect(await res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = async() => expect(await res).to.not.satisfyApiSpec;
        return expect(assertion()).to.be.rejectedWith(
          `expected res not to satisfy API spec for '200' response defined for endpoint 'GET /test/responseBody/string' in OpenAPI spec\nres: ${
            util.inspect({
              status: 200,
              body: 'valid body (string)',
            })
          }`
        );
      });
    });

  });

});
