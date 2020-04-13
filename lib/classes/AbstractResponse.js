const { stringify } = require('../utils');

class AbstractResponse {
  constructor(res) {
    this.res = res;
  }

  hasNoBody() {
    const hasNoContentTypeHeader = this.res.hasOwnProperty('headers')
      && !this.res.headers.hasOwnProperty('content-type');
    return (hasNoContentTypeHeader && this.bodyHasNoContent);
  }

  summary() {
    return {
      body: this.body,
    };
  }

  toString() {
    return stringify(this.summary());
  }
}

module.exports = AbstractResponse;
