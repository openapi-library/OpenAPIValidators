import chai from 'chai';
import path from 'path';
import chaiHttp from 'chai-http';
import axios, { AxiosResponse } from 'axios';
import supertest, { Response as SuperAgentResponse } from 'supertest';
import requestPromise from 'request-promise';
import type { Response as RequestPromiseResponse } from 'request';

import { str } from '../../../../../commonTestResources/utils';
import app, { port } from '../../../../../commonTestResources/exampleApp';
import chaiResponseValidator from '../../..';

const appOrigin = `http://localhost:${port}`;
const pathToApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.yml',
);
const { expect, AssertionError } = chai;

describe('Parsing responses from different request modules', () => {
  before(() => {
    chai.use(chaiResponseValidator(pathToApiSpec));
  });

  describe('chai-http', () => {
    chai.use(chaiHttp);

    describe('res header is application/json, and res.body is a string', () => {
      let res: ChaiHttp.Response;
      before(async () => {
        res = await chai
          .request(app)
          .get('/header/application/json/and/responseBody/string');
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
      let res: ChaiHttp.Response;
      before(async () => {
        res = await chai
          .request(app)
          .get('/header/application/json/and/responseBody/emptyObject');
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
      let res: ChaiHttp.Response;
      before(async () => {
        res = await chai
          .request(app)
          .get('/header/application/json/and/responseBody/boolean');
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
      let res: ChaiHttp.Response;
      before(async () => {
        res = await chai
          .request(app)
          .get('/header/application/json/and/responseBody/nullable');
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
      let res: ChaiHttp.Response;
      before(async () => {
        res = await chai.request(app).get('/header/text/html');
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
      let res: ChaiHttp.Response;
      before(async () => {
        res = await chai
          .request(app)
          .get('/no/content-type/header/and/no/response/body');
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
      let res: SuperAgentResponse;
      before(async () => {
        res = await supertest(app).get(
          '/header/application/json/and/responseBody/string',
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
      let res: SuperAgentResponse;
      before(async () => {
        res = await supertest(app).get(
          '/header/application/json/and/responseBody/emptyObject',
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
      let res: SuperAgentResponse;
      before(async () => {
        res = await supertest(app).get('/header/text/html');
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
      let res: SuperAgentResponse;
      before(async () => {
        res = await supertest(app).get(
          '/header/application/json/and/responseBody/nullable',
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
      let res: SuperAgentResponse;
      before(async () => {
        res = await supertest(app).get(
          '/no/content-type/header/and/no/response/body',
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
      let res: AxiosResponse;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/header/application/json/and/responseBody/string`,
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
      let res: AxiosResponse;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/header/application/json/and/responseBody/emptyObject`,
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
      let res: AxiosResponse;
      before(async () => {
        res = await axios.get(`${appOrigin}/header/text/html`);
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
      let res: AxiosResponse;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/header/application/json/and/responseBody/nullable`,
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
      let res: AxiosResponse;
      before(async () => {
        res = await axios.get(
          `${appOrigin}/no/content-type/header/and/no/response/body`,
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
      let res: RequestPromiseResponse;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/string`,
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
      let res: RequestPromiseResponse;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/string`,
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
      let res: RequestPromiseResponse;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/emptyObject`,
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
      let res: RequestPromiseResponse;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/emptyObject`,
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
      let res: RequestPromiseResponse;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/text/html`,
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
      let res: RequestPromiseResponse;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/nullable`,
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
      let res: RequestPromiseResponse;
      before(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/no/content-type/header/and/no/response/body`,
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
