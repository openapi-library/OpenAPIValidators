
const RequestPromiseResponse = require('../../src/openapi-validator/lib/classes/RequestPromiseResponse');

describe('RequestPromiseResponse', () => {
  describe('response body as object', () => {
    it('should correctly process body', () => {
      const body = { test: 'object' };
      const requestPromiseResponse = new RequestPromiseResponse({ body });
      const processedBody = requestPromiseResponse.getBodyForValidation();
      expect(processedBody).toStrictEqual(body);
    });
  });
  describe('response body as string', () => {
    it('should correctly process body', () => {
      const body = '{ "test": "string" }';
      const requestPromiseResponse = new RequestPromiseResponse({ body });
      const processedBody = requestPromiseResponse.getBodyForValidation();
      expect(processedBody).toStrictEqual({ test: 'string' });
    });
  });
});
