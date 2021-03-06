const AbstractResponse = require('./AbstractResponse');

const isEmptyObj = (obj) =>
  !!obj && Object.entries(obj).length === 0 && obj.constructor === Object;

class SuperAgentResponse extends AbstractResponse {
  constructor(res) {
    super(res);
    this.status = res.status;
    this.body = res.body;
    this.req = res.req;
    this.isResTextPopulatedInsteadOfResBody =
      res.text !== '{}' && isEmptyObj(this.body);
    this.bodyHasNoContent = res.text === '';
  }

  getBodyForValidation() {
    if (this.bodyHasNoContent) {
      return null;
    }
    if (this.isResTextPopulatedInsteadOfResBody) {
      return this.res.text;
    }
    return this.body;
  }

  summary() {
    const summary = super.summary();
    if (this.isResTextPopulatedInsteadOfResBody) {
      summary.text = this.res.text;
    }
    return summary;
  }
}

module.exports = SuperAgentResponse;
