import AxiosResponse from './classes/AxiosResponse';
import SuperAgentResponse from './classes/SuperAgentResponse';
import RequestPromiseResponse from './classes/RequestPromiseResponse';

export default function makeResponse(res) {
  if (Object.prototype.hasOwnProperty.call(res, 'data')) {
    return new AxiosResponse(res);
  }
  if (Object.prototype.hasOwnProperty.call(res, 'status')) {
    return new SuperAgentResponse(res);
  }
  return new RequestPromiseResponse(res);
}
