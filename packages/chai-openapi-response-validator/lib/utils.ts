import { inspect } from 'util';

export const stringify = (obj) =>
  inspect(obj, { showHidden: false, depth: null });

export const joinWithNewLines = (...lines) => lines.join('\n\n');
