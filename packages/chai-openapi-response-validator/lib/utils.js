const util = require('util');

const stringify = (obj) => util.inspect(
  obj,
  { showHidden: false, depth: null },
);

module.exports = {
  stringify,
};
