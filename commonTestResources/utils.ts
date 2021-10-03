import { inspect } from 'util';

export const str = (obj: unknown): string =>
  inspect(obj, { showHidden: false, depth: null });

export const joinWithNewLines = (...lines: string[]): string =>
  lines.join('\n\n');
