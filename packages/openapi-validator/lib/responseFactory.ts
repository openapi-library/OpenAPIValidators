import { RawResponse } from './classes/AbstractResponse';
import AxiosResponse from './classes/AxiosResponse';
import RequestPromiseResponse from './classes/RequestPromiseResponse';
import SuperAgentResponse from './classes/SuperAgentResponse';

export default function makeResponse(
  res: RawResponse,
): AxiosResponse | SuperAgentResponse | RequestPromiseResponse {
  if ('data' in res) {
    return new AxiosResponse(res);
  }
  if ('status' in res) {
    return new SuperAgentResponse(res);
  }
  return new RequestPromiseResponse(res);
}
