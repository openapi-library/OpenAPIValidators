import type { AxiosResponse as AxiosResponseType } from 'axios';
import AbstractResponse from './AbstractResponse';

export type RawAxiosResponse = AxiosResponseType;

export default class AxiosResponse extends AbstractResponse {
  constructor(protected override res: RawAxiosResponse) {
    super(res);
    this.status = res.status;
    this.body = res.data;
    this.req = res.request;
    this.bodyHasNoContent = this.body === '';
  }

  getBodyForValidation(): AxiosResponse['body'] {
    if (this.bodyHasNoContent) {
      return null;
    }
    return this.body;
  }
}
