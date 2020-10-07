import type { Response } from 'superagent';
import { isEmptyObj } from '../utils';
import AbstractResponse from './AbstractResponse';

type ISuperAgentResponse = Response & {
  req: any;
};
export default class SuperAgentResponse extends AbstractResponse {
  #isResTextPopulatedInsteadOfResBody: boolean;

  constructor(res: ISuperAgentResponse) {
    super(res);
    this.status = res.status;
    this.body = res.body;
    this.req = res.req;
    this.#isResTextPopulatedInsteadOfResBody =
      res.text !== '{}' && isEmptyObj(this.body);
    this.bodyHasNoContent = res.text === '';
  }

  getBodyForValidation() {
    if (this.bodyHasNoContent) {
      return null;
    }
    if (this.#isResTextPopulatedInsteadOfResBody) {
      return this.res.text;
    }
    return this.body;
  }

  summary() {
    const summary = super.summary();
    if (this.#isResTextPopulatedInsteadOfResBody) {
      summary.text = this.res.text;
    }
    return summary;
  }
}
