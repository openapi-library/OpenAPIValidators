import type { Response } from 'request';
import type { AxiosResponse as IAxiosResponse } from 'axios';
import AbstractResponse from './AbstractResponse';

export const isAxiosResponse = (res: Response): boolean =>
  Object.prototype.hasOwnProperty.call(res, 'data');

export default class AxiosResponse extends AbstractResponse {
  constructor(res: IAxiosResponse) {
    super(res);
    this.status = res.status;
    this.body = res.data;
    this.req = res.request;
    this.bodyHasNoContent = this.body === '';
  }

  getBodyForValidation(): any {
    if (this.bodyHasNoContent) {
      return null;
    }
    return this.body;
  }
}
