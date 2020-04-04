const Response = require('./classes/Response');
const AxiosResponse = require('./classes/AxiosResponse');
const RequestPromiseResponse = require('./classes/RequestPromiseResponse');

function makeResponse(res) {
  if (res.hasOwnProperty('data')) {
    return new AxiosResponse(res);
  }
  if (res.hasOwnProperty('status')) {
    return new Response(res);
  }
  return new RequestPromiseResponse(res);
}

module.exports = {
  makeResponse,
};
