/** *****************************************************************************
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
 ****************************************************************************** */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');
const { inspect } = require('util');

const chaiHttp = require('chai-http');
const axios = require('axios');
const supertest = require('supertest');
const requestPromise = require('request-promise');

const chaiResponseValidator = require('../../..');
const app = require('../../../../../commonTestResources/exampleApp');
const { port } = require('../../../../../commonTestResources/config');

const str = (obj) => inspect(obj, { showHidden: false, depth: null });
const appOrigin = `http://localhost:${port}`;
const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/valid/openapi3.yml');
chai.use(chaiAsPromised);
const { expect, AssertionError } = chai;

describe('Parsing responses from different request modules', function () {
  before(function () {
    chai.use(chaiResponseValidator(pathToApiSpec));
  });

  describe('chai-http', function () {
    chai.use(chaiHttp);

    describe('res header is application/json, and res.body is a string', function () {
      let res;
      before(async function () {
        res = await chai.request(app).get('/test/header/application/json/and/responseBody/string');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', function () {
      let res;
      before(async function () {
        res = await chai.request(app).get('/test/header/application/json/and/responseBody/emptyObject');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a boolean (false)', function () {
      let res;
      before(async function () {
        res = await chai.request(app).get('/test/header/application/json/and/responseBody/boolean');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: false,
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function () {
      let res;
      before(async function () {
        res = await chai.request(app).get('/test/header/application/json/and/responseBody/nullable');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: null,
          }),
        );
      });
    });

    describe('res header is text/html, res.body is {}, and res.text is a string', function () {
      let res;
      before(async function () {
        res = await chai.request(app).get('/test/header/text/html');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
            text: 'res.body is a string',
          }),
        );
      });
    });

    describe('res has no content-type header, res.body is {}, and res.text is empty string', function () {
      let res;
      before(async function () {
        res = await chai.request(app).get('/test/no/content-type/header/and/no/response/body');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
            text: '',
          }),
        );
      });
    });
  });

  describe('supertest', function () {
    describe('res header is application/json, and res.body is a string', function () {
      let res;
      before(async function () {
        res = await supertest(app).get('/test/header/application/json/and/responseBody/string');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', function () {
      let res;
      before(async function () {
        res = await supertest(app).get('/test/header/application/json/and/responseBody/emptyObject');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is text/html, res.body is {}, and res.text is a string', function () {
      let res;
      before(async function () {
        res = await supertest(app).get('/test/header/text/html');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
            text: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function () {
      let res;
      before(async function () {
        res = await supertest(app).get('/test/header/application/json/and/responseBody/nullable');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: null,
          }),
        );
      });
    });

    describe('res has no content-type header, res.body is {}, and res.text is empty string', function () {
      let res;
      before(async function () {
        res = await supertest(app).get('/test/no/content-type/header/and/no/response/body');
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
            text: '',
          }),
        );
      });
    });
  });

  describe('axios', function () {
    before(function () {
      app.server = app.listen(port);
    });
    after(function () {
      app.server.close();
    });
    describe('res header is application/json, and res.body is a string', function () {
      let res;
      before(async function () {
        res = await axios.get(`${appOrigin}/test/header/application/json/and/responseBody/string`);
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', function () {
      let res;
      before(async function () {
        res = await axios.get(`${appOrigin}/test/header/application/json/and/responseBody/emptyObject`);
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is text/html, res.body is a string', function () {
      let res;
      before(async function () {
        res = await axios.get(`${appOrigin}/test/header/text/html`);
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function () {
      let res;
      before(async function () {
        res = await axios.get(`${appOrigin}/test/header/application/json/and/responseBody/nullable`);
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: null,
          }),
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', function () {
      let res;
      before(async function () {
        res = await axios.get(`${appOrigin}/test/no/content-type/header/and/no/response/body`);
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: '',
          }),
        );
      });
    });
  });

  describe('request-promise', function () {
    before(function () {
      app.server = app.listen(port);
    });
    after(function () {
      app.server.close();
    });

    describe('json is set to true, res header is application/json, and res.body is a string', function () {
      let res;
      before(async function () {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/string`,
          resolveWithFullResponse: true,
          json: true,
        });
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a string', function () {
      let res;
      before(async function () {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/string`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('json is set to true, res header is application/json, and res.body is {}', function () {
      let res;
      before(async function () {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/emptyObject`,
          resolveWithFullResponse: true,
          json: true,
        });
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is \'{}\'', function () {
      let res;
      before(async function () {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/emptyObject`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: '{}',
          }),
        );
      });
    });

    describe('res header is text/html, res.body is a string', function () {
      let res;
      before(async function () {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/text/html`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', function () {
      let res;
      before(async function () {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/nullable`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'null',
          }),
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', function () {
      let res;
      before(async function () {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/no/content-type/header/and/no/response/body`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', function () {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', function () {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: '',
          }),
        );
      });
    });
  });
});
