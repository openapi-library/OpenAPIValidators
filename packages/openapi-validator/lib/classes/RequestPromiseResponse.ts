import type { Request, Response } from 'request';
import AbstractResponse from './AbstractResponse';

export type RawRequestPromiseResponse = Response & {
  req: Request;
  request: Response['request'] & {
    _json?: unknown;
  };
};

export default class RequestPromiseResponse extends AbstractResponse {
  constructor(protected override res: RawRequestPromiseResponse) {
    super(res);
    this.status = res.statusCode;
    this.body = res.request._json // eslint-disable-line no-underscore-dangle
      ? res.body
      : res.body.replace(/"/g, '');
    this.req = res.req;
    this.bodyHasNoContent = this.body === '';
  }

  getBodyForValidation(): RequestPromiseResponse['body'] {
    if (this.bodyHasNoContent) {
      return null;
    }
    try {
      return JSON.parse(this.body as string);
    } catch (error) {
      // if JSON.parse errors, then body is not stringfied JSON that
      // needs parsing into a JSON object, so just move to the next
      // block and return the body
    }
    return this.body;
  }
}
