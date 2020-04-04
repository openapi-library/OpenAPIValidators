const utils = require('../utils');

class Response {
  constructor(res) {
    this.res = res;
    this.isResTextPopulatedInsteadOfResBody = (utils.isEmptyObj(this.body()))
      && this.res.hasOwnProperty('text')
      && this.res.text !== '{}';
  }

  status() {
    return this.res.status // for all modules except request-promise
      || this.res.statusCode // for request-promise
    ;
  }

  body() {
    let body = this.res.body;
    if (typeof body == 'string') {
      body = body.replace(/"/g, '');
    }
    return body;
  }

  hasNoBody() {
    const hasNoContentTypeHeader = this.res.hasOwnProperty('headers')
      && !this.res.headers.hasOwnProperty('content-type');
    const bodyHasNoContent = (
      this.res.text === '' // for superagent-based request modules
      || this.res.body === '' // for request-promise
    );
    return (hasNoContentTypeHeader && bodyHasNoContent);
  }

  getBodyForValidation() {
    if (this.hasNoBody()) {
      return null;
    }

    // for superagent-based request modules
    if (this.isResTextPopulatedInsteadOfResBody) {
      return this.res.text;
    }

    const body = this.body();

    // for request-promise
    try {
      const parsedBody = JSON.parse(body);
      if (utils.isEmptyObj(parsedBody) || parsedBody === null) {
        return parsedBody;
      }
    } catch (error) {
      // if JSON.parse errors, then body is JSON not string,
      // so just move to the next block and return the body
    }

    return body;
  }

  req() {
    return this.res.req;
  }

  summary() {
    const summary = {
      status: this.status(),
      body: this.body(),
    };

    // for superagent-based request modules
    if (this.isResTextPopulatedInsteadOfResBody) {
      summary.text = this.res.text;
    }

    return summary;
  }

  toString() {
    return utils.stringify(this.summary());
  }
}

module.exports = Response;
