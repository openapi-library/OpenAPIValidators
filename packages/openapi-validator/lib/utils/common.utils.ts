import { Path } from 'path-parser';
import url from 'url';
import { inspect } from 'util';
import type { ActualRequest } from '../classes/AbstractResponse';

export const stringify = (obj: unknown): string =>
  inspect(obj, { depth: null });

/**
 * Excludes the query because path = pathname + query
 */
export const getPathname = (request: ActualRequest): string =>
  url.parse(request.path).pathname;

/**
 * Converts all {foo} to :foo
 */
const convertOpenApiPathToColonForm = (openApiPath: string): string =>
  openApiPath.replace(/{/g, ':').replace(/}/g, '');

const doesColonPathMatchPathname = (
  pathInColonForm: string,
  pathname: string,
): boolean => {
  const pathParamsInPathname = new Path(pathInColonForm).test(pathname); // => one of: null, {}, {exampleParam: 'foo'}
  return Boolean(pathParamsInPathname);
};

const doesOpenApiPathMatchPathname = (
  openApiPath: string,
  pathname: string,
): boolean => {
  const pathInColonForm = convertOpenApiPathToColonForm(openApiPath);
  return doesColonPathMatchPathname(pathInColonForm, pathname);
};

const countPathParams = (openApiPath) => {
  return (openApiPath.match(/\{/g) || []).length;
};

export const findOpenApiPathMatchingPossiblePathnames = (
  possiblePathnames: string[],
  OAPaths: string[],
): string => {
  let openApiPath;
  let nbPathParams = -1;
  // eslint-disable-next-line no-restricted-syntax
  for (const pathname of possiblePathnames) {
    // eslint-disable-next-line no-restricted-syntax
    for (const OAPath of OAPaths) {
      const count = countPathParams(OAPath);
      if (OAPath === pathname) {
        return OAPath;
      }
      if (doesOpenApiPathMatchPathname(OAPath, pathname)) {
        if (nbPathParams == -1 || count < nbPathParams) {
          nbPathParams = count;
          openApiPath = OAPath;
        }
      }
    }
  }
  return openApiPath;
};

export const defaultBasePath = '/';

export const getPathnameWithoutBasePath = (
  basePath: string,
  pathname: string,
): string =>
  basePath === defaultBasePath ? pathname : pathname.replace(basePath, '');
