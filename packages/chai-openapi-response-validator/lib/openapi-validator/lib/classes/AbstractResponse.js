const { stringify } = require('../utils');

class AbstractResponse {
  constructor(res) {
    this.res = res;
  }

  hasNoBody() {
    const hasNoContentTypeHeader = Object.prototype.hasOwnProperty.call(this.res, 'headers')
      && !Object.prototype.hasOwnProperty.call(this.res.headers, 'content-type');
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
