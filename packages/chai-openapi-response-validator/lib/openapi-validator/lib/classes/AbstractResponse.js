const { stringify } = require('../utils/common.utils');

class AbstractResponse {
  constructor(res) {
    this.res = res;
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
