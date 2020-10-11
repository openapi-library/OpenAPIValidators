const { inspect } = require('util');

const stringify = (obj) => inspect(obj, { showHidden: false, depth: null });

const joinWithNewLines = (...lines) => lines.join('\n\n');

module.exports = {
  stringify,
  joinWithNewLines,
};
