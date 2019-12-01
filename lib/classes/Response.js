const utils = require('../utils');

class Response {
  constructor(res) {
    this.res = res;
  }

  status() {
    return this.res.status // all modules except request-promise
      || this.res.statusCode // request-promise
    ;
  }

  body() {
    let body = this.res.body // all modules except axios
      || this.res.data // axios
      ;
    if (typeof body == 'string') {
      body = body.replace(/"/g, '');
    }
    return body;
  }

  req() {
    return this.res.req // all modules except axios
      || this.res.request; // axios
  }

  summary() {
    const summary = {
      status: this.status(),
      body: this.body(),
    };
    if (utils.isEmptyObj(this.body()) && this.res.hasOwnProperty('text')) {
      summary.text = this.res.text;
    }
    return summary;
  }

  toString() {
    return utils.stringify(this.summary());
  }
}

module.exports = Response;
