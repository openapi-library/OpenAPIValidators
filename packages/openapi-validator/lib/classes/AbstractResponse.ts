import { stringify } from '../utils/common.utils';
import type { RawAxiosResponse } from './AxiosResponse';
import type { RawRequestPromiseResponse } from './RequestPromiseResponse';
import type { RawSuperAgentResponse } from './SuperAgentResponse';

export type RawResponse =
  | RawAxiosResponse
  | RawSuperAgentResponse
  | RawRequestPromiseResponse;

export default abstract class AbstractResponse {
  public status: number;

  public req: { method: string; path: string };

  public abstract getBodyForValidation(): unknown;

  protected body: unknown;

  protected bodyHasNoContent: boolean;

  constructor(protected res: RawResponse) {}

  summary(): { body: unknown } {
    return {
      body: this.body,
    };
  }

  toString(): string {
    return stringify(this.summary());
  }
}

export type ActualResponse = AbstractResponse;

export type ActualRequest = AbstractResponse['req'];
