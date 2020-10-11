const { inspect } = require('util');

const joinWithNewLines = (...lines) => lines.join('\n\n');

const str = (obj) => inspect(obj, { showHidden: false, depth: null });

module.exports = { joinWithNewLines, str };
