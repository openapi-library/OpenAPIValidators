import { inspect } from 'util';

export const joinWithNewLines = (...lines) => lines.join('\n\n');

export const str = (obj) => inspect(obj, { showHidden: false, depth: null });
