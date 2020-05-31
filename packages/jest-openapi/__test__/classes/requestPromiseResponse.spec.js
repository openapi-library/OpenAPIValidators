
const RequestPromiseResponse = require('../../src/openapi-validator/lib/classes/RequestPromiseResponse');

describe('RequestPromiseResponse', () => {
  const json = { request: { _json: true } };
  describe('response body as object', () => {
    it('should correctly process body', () => {
      const body = { test: 'object' };
      const requestPromiseResponse = new RequestPromiseResponse({ body, ...json });
      const processedBody = requestPromiseResponse.getBodyForValidation();
      expect(processedBody).toStrictEqual(body);
    });
  });
  describe('response body as string', () => {
    it('should correctly process body', () => {
      const body = '{ "test": "string" }';
      const requestPromiseResponse = new RequestPromiseResponse({ body, ...json });
      const processedBody = requestPromiseResponse.getBodyForValidation();
      expect(processedBody).toStrictEqual({ test: 'string' });
    });
  });
  it('should return null when body is empty string', () => {
    const requestPromiseResponse = new RequestPromiseResponse({ body: '', request: { headers: {} } });
    const processedBody = requestPromiseResponse.getBodyForValidation();
    expect(processedBody).toBeNull();
  });
});
