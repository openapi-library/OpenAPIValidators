const util = require('util');

const isEmptyObj = (obj) =>
  !!obj
  && Object.entries(obj).length === 0
  && obj.constructor === Object;

const stringify = (obj) =>
  util.inspect(
    obj,
    { showHidden: false, depth: null }
  );

module.exports = {
  isEmptyObj,
  stringify,
};
