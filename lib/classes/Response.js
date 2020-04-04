const utils = require('../utils');

class Response {
  constructor(res) {
    this.res = res;
    this.isResTextPopulatedInsteadOfResBody = (utils.isEmptyObj(this.body()))
      && this.res.hasOwnProperty('text')
      && this.res.text !== '{}';
  }

  status() {
    return this.res.status;
  }

  body() {
    return this.res.body;
  }

  hasNoBody() {
    const hasNoContentTypeHeader = this.res.hasOwnProperty('headers')
      && !this.res.headers.hasOwnProperty('content-type');
    const bodyHasNoContent = (this.res.text === ''); // for superagent-based request modules
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
