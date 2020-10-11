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

const chaiHttp = require('chai-http');
const axios = require('axios');
const supertest = require('supertest');
const requestPromise = require('request-promise');

const { str } = require('../../../../../commonTestResources/utils');
const app = require('../../../../../commonTestResources/exampleApp');
const { port } = require('../../../../../commonTestResources/config');

const chaiResponseValidator = require('../../..');

const appOrigin = `http://localhost:${port}`;
const pathToApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.yml',
);
chai.use(chaiAsPromised);
const { expect, AssertionError } = chai;

describe('Parsing responses from different request modules', () => {
  before(() => {
    chai.use(chaiResponseValidator(pathToApiSpec));
  });

  describe('chai-http', () => {
    chai.use(chaiHttp);

    describe('res header is application/json, and res.body is a string', () => {
      let res;
      before(async () => {
        res = await chai
          .request(app)
          .get('/test/header/application/json/and/responseBody/string');
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', () => {
      let res;
      before(async () => {
        res = await chai
          .request(app)
          .get('/test/header/application/json/and/responseBody/emptyObject');
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a boolean (false)', () => {
      let res;
      before(async () => {
        res = await chai
          .request(app)
          .get('/test/header/application/json/and/responseBody/boolean');
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: false,
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', () => {
      let res;
      before(async () => {
        res = await chai
          .request(app)
          .get('/test/header/application/json/and/responseBody/nullable');
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: null,
          }),
        );
      });
    });

    describe('res header is text/html, res.body is {}, and res.text is a string', () => {
      let res;
      before(async () => {
        res = await chai.request(app).get('/test/header/text/html');
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
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

    describe('res has no content-type header, res.body is {}, and res.text is empty string', () => {
      let res;
      before(async () => {
        res = await chai
          .request(app)
          .get('/test/no/content-type/header/and/no/response/body');
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
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

  describe('supertest', () => {
    describe('res header is application/json, and res.body is a string', () => {
      let res;
      before(async () => {
        res = await supertest(app).get(
          '/test/header/application/json/and/responseBody/string',
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', () => {
      let res;
      before(async () => {
        res = await supertest(app).get(
          '/test/header/application/json/and/responseBody/emptyObject',
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is text/html, res.body is {}, and res.text is a string', () => {
      let res;
      before(async () => {
        res = await supertest(app).get('/test/header/text/html');
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
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

    describe('res header is application/json, and res.body is a null', () => {
      let res;
      before(async () => {
        res = await supertest(app).get(
          '/test/header/application/json/and/responseBody/nullable',
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: null,
          }),
        );
      });
    });

    describe('res has no content-type header, res.body is {}, and res.text is empty string', () => {
      let res;
      before(async () => {
        res = await supertest(app).get(
          '/test/no/content-type/header/and/no/response/body',
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
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

  describe('axios', () => {
    before(() => {
      app.server = app.listen(port);
    });
    after(() => {
      app.server.close();
    });
    describe('res header is application/json, and res.body is a string', () => {
      let res;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/test/header/application/json/and/responseBody/string`,
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', () => {
      let res;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/test/header/application/json/and/responseBody/emptyObject`,
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is text/html, res.body is a string', () => {
      let res;
      before(async () => {
        res = await axios.get(`${appOrigin}/test/header/text/html`);
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', () => {
      let res;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/test/header/application/json/and/responseBody/nullable`,
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: null,
          }),
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', () => {
      let res;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/test/no/content-type/header/and/no/response/body`,
        );
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
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

  describe('request-promise', () => {
    before(() => {
      app.server = app.listen(port);
    });
    after(() => {
      app.server.close();
    });

    describe('json is set to true, res header is application/json, and res.body is a string', () => {
      let res;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/string`,
          resolveWithFullResponse: true,
          json: true,
        });
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a string', () => {
      let res;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/string`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('json is set to true, res header is application/json, and res.body is {}', () => {
      let res;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/emptyObject`,
          resolveWithFullResponse: true,
          json: true,
        });
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: {},
          }),
        );
      });
    });

    describe("res header is application/json, and res.body is '{}'", () => {
      let res;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/emptyObject`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: '{}',
          }),
        );
      });
    });

    describe('res header is text/html, res.body is a string', () => {
      let res;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/text/html`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', () => {
      let res;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/header/application/json/and/responseBody/nullable`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(
          AssertionError,
          str({
            body: 'null',
          }),
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', () => {
      let res;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/test/no/content-type/header/and/no/response/body`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });
      it('fails when using .not', () => {
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
