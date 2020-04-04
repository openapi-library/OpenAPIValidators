const Response = require('./classes/Response');
const AxiosResponse = require('./classes/AxiosResponse');

function makeResponse(res) {
  if (res.hasOwnProperty('data')) {
    return new AxiosResponse(res);
  }
  return new Response(res);
}

module.exports = {
  makeResponse,
};
