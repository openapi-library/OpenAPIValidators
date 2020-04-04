const Response = require('./Response');

class RequestPromiseResponse extends Response {
  constructor(res) {
    super(res);
    this.status = res.statusCode;
    this.body = res.body.replace(/"/g, '');
    this.req = res.req;
    this.bodyHasNoContent = this.body === '';
  }

  getBodyForValidation() {
    if (this.hasNoBody()) {
      return null;
    }
    try {
      return JSON.parse(this.body);
    } catch (error) {
      // if JSON.parse errors, then body is not stringfied JSON that
      // needs parsing into a JSON object, so just move to the next
      // block and return the body
    }
    return this.body;
  }
}

module.exports = RequestPromiseResponse;
