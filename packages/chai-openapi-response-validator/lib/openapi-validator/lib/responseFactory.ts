import AxiosResponse, { isAxiosResponse } from './classes/AxiosResponse';
import RequestPromiseResponse, { isRequestPromiseResponse } from './classes/RequestPromiseResponse';
import SuperAgentResponse from './classes/SuperAgentResponse';

export default (res) => {
  if (isAxiosResponse(res)) {
    return new AxiosResponse(res);
  }
  if (isRequestPromiseResponse(res)) {
    return new RequestPromiseResponse(res);
  }
  return new SuperAgentResponse(res);
}
