const AxiosResponse = require('./classes/AxiosResponse');
const SuperAgentResponse = require('./classes/SuperAgentResponse');
const RequestPromiseResponse = require('./classes/RequestPromiseResponse');

function makeResponse(res) {
  if (res.hasOwnProperty('data')) {
    return new AxiosResponse(res);
  }
  if (res.hasOwnProperty('status')) {
    return new SuperAgentResponse(res);
  }
  return new RequestPromiseResponse(res);
}

module.exports = {
  makeResponse,
};
