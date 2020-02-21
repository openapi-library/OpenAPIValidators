const url = require('url');

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
    let body = this.res.body !== undefined
      ? this.res.body // for all modules except axios
      : this.res.data // for axios
      ;
    if (typeof body == 'string') {
      body = body.replace(/"/g, '');
    }
    return body;
  }

  getBodyForValidation() {
    // for superagent-based request modules
    if (this.isResTextPopulatedInsteadOfResBody) {
      return this.res.text;
    }

    const body = this.body();

    // for request-promise
    try {
      const parsedBody = JSON.parse(body);
      if (utils.isEmptyObj(parsedBody)) {
        return parsedBody;
      }
    } catch (error) {
      // if JSON.parse errors, then body is JSON not string,
      // so just move to the next block and return the body
    }

    return body;
  }

  req() {
    return this.res.req // for all modules except axios
      || this.res.request; // for axios
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

const extractPathname = (actualRequest) => {
  const { pathname } = url.parse(actualRequest.path); // excludes the query (because: path = pathname + query)
  return pathname;
};

module.exports = {
  Response,
  extractPathname,
};
