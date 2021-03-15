import path from 'path';
import axios from 'axios';
import supertest from 'supertest';
import requestPromise from 'request-promise';

import { str } from '../../../../../commonTestResources/utils';
import app from '../../../../../commonTestResources/exampleApp';
import { port } from '../../../../../commonTestResources/config';
import jestOpenAPI from '../../..';

const appOrigin = `http://localhost:${port}`;
const pathToApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.yml',
);

describe('Parsing responses from different request modules', () => {
  beforeAll(() => {
    jestOpenAPI(pathToApiSpec);
  });

  // These tests cover both supertest and chai-http, because they make requests the same way (using superagent)
  describe('supertest', () => {
    describe('res header is application/json, and res.body is a string', () => {
      let res;
      beforeAll(async () => {
        res = await supertest(app).get(
          '/header/application/json/and/responseBody/string',
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', () => {
      let res;
      beforeAll(async () => {
        res = await supertest(app).get(
          '/header/application/json/and/responseBody/emptyObject',
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is text/html, res.body is {}, and res.text is a string', () => {
      let res;
      beforeAll(async () => {
        res = await supertest(app).get('/header/text/html');
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: {},
            text: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', () => {
      let res;
      beforeAll(async () => {
        res = await supertest(app).get(
          '/header/application/json/and/responseBody/nullable',
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: null,
          }),
        );
      });
    });

    describe('res has no content-type header, res.body is {}, and res.text is empty string', () => {
      let res;
      beforeAll(async () => {
        res = await supertest(app).get(
          '/no/content-type/header/and/no/response/body',
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: {},
            text: '',
          }),
        );
      });
    });
  });

  describe('axios', () => {
    beforeAll(() => {
      app.server = app.listen(port);
    });
    afterAll(() => {
      app.server.close();
    });
    describe('res header is application/json, and res.body is a string', () => {
      let res;
      beforeAll(async () => {
        res = await axios.get(
          `${appOrigin}/header/application/json/and/responseBody/string`,
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is {}', () => {
      let res;
      beforeAll(async () => {
        res = await axios.get(
          `${appOrigin}/header/application/json/and/responseBody/emptyObject`,
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: {},
          }),
        );
      });
    });

    describe('res header is text/html, res.body is a string', () => {
      let res;
      beforeAll(async () => {
        res = await axios.get(`${appOrigin}/header/text/html`);
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', () => {
      let res;
      beforeAll(async () => {
        res = await axios.get(
          `${appOrigin}/header/application/json/and/responseBody/nullable`,
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: null,
          }),
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', () => {
      let res;
      beforeAll(async () => {
        res = await axios.get(
          `${appOrigin}/no/content-type/header/and/no/response/body`,
        );
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: '',
          }),
        );
      });
    });
  });

  describe('request-promise', () => {
    beforeAll(() => {
      app.server = app.listen(port);
    });
    afterAll(() => {
      app.server.close();
    });

    describe('json is set to true, res header is application/json, and res.body is a string', () => {
      let res;
      beforeAll(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/string`,
          resolveWithFullResponse: true,
          json: true,
        });
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a string', () => {
      let res;
      beforeAll(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/string`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('json is set to true, res header is application/json, and res.body is {}', () => {
      let res;
      beforeAll(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/emptyObject`,
          resolveWithFullResponse: true,
          json: true,
        });
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: {},
          }),
        );
      });
    });

    describe("res header is application/json, and res.body is '{}'", () => {
      let res;
      beforeAll(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/emptyObject`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: '{}',
          }),
        );
      });
    });

    describe('res header is text/html, res.body is a string', () => {
      let res;
      beforeAll(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/text/html`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: 'res.body is a string',
          }),
        );
      });
    });

    describe('res header is application/json, and res.body is a null', () => {
      let res;
      beforeAll(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/header/application/json/and/responseBody/nullable`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: 'null',
          }),
        );
      });
    });

    describe('res has no content-type header, and res.body is empty string', () => {
      let res;
      beforeAll(async () => {
        res = await requestPromise({
          method: 'GET',
          uri: `${appOrigin}/no/content-type/header/and/no/response/body`,
          resolveWithFullResponse: true,
        });
      });
      it('passes', () => {
        expect(res).toSatisfyApiSpec();
      });
      it('fails when using .not', () => {
        const assertion = () => expect(res).not.toSatisfyApiSpec();
        expect(assertion).toThrow(
          str({
            body: '',
          }),
        );
      });
    });
  });
});
