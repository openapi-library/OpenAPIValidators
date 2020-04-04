const Response = require('./Response');

class RequestPromiseResponse extends Response {
  status() {
    return this.res.statusCode;
  }

  body() {
    const bodyWithStringQuotes = this.res.body;
    const body = bodyWithStringQuotes.replace(/"/g, '');
    return body;
  }

  hasNoBody() {
    const hasNoContentTypeHeader = this.res.hasOwnProperty('headers')
      && !this.res.headers.hasOwnProperty('content-type');
    const bodyHasNoContent = (this.res.body === '');
    return (hasNoContentTypeHeader && bodyHasNoContent);
  }

  getBodyForValidation() {
    if (this.hasNoBody()) {
      return null;
    }
    const body = this.body();
    try {
      return JSON.parse(body);
    } catch (error) {
      // if JSON.parse errors, then body is not stringfied JSON that
      // needs parsing into a JSON object, so just move to the next
      // block and return the body
    }
    return body;
  }

  req() {
    return this.res.req;
  }

  summary() {
    return {
      status: this.status(),
      body: this.body(),
    };
  }
}

module.exports = RequestPromiseResponse;
