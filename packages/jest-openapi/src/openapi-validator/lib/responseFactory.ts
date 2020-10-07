const AxiosResponse = require('./classes/AxiosResponse');
const SuperAgentResponse = require('./classes/SuperAgentResponse');
const RequestPromiseResponse = require('./classes/RequestPromiseResponse');

function makeResponse(res) {
  if (Object.prototype.hasOwnProperty.call(res, 'data')) {
    return new AxiosResponse(res);
  }
  if (Object.prototype.hasOwnProperty.call(res, 'status')) {
    return new SuperAgentResponse(res);
  }
  return new RequestPromiseResponse(res);
}

module.exports = {
  makeResponse,
};
