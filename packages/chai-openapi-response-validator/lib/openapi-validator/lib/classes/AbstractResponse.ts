import { stringify } from '../utils';

type Summary = {
  body: any;
  text?: string;
};

export default class AbstractResponse {
  protected res: any;
  protected req: any;
  protected bodyHasNoContent: boolean;
  protected status: number;
  protected body: any;
  // protected readonly res: any;
  // protected readonly req: any;
  // protected readonly bodyHasNoContent: boolean;
  // protected readonly status: number;
  // protected readonly body: any;

  constructor(res) {
    this.res = res;
  }

  summary(): Summary {
    return {
      body: this.body,
    };
  }

  toString() {
    return stringify(this.summary());
  }
}
