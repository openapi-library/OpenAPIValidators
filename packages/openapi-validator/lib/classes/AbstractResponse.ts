import { stringify } from '../utils/common.utils';

export default class AbstractResponse {
  protected res: any;

  protected body: any;

  protected status: any;

  protected req: any;

  protected bodyHasNoContent: boolean;

  constructor(res) {
    this.res = res;
  }

  summary(): { body: any; text?: string } {
    return {
      body: this.body,
    };
  }

  toString() {
    return stringify(this.summary());
  }
}
