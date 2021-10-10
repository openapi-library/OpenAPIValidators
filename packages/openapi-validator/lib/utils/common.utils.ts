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

/** 
 * Remove commas to allow support to arrays in style: simple; explode: false 
*/
const removeCommasFromPath = (path: stirng): string => path.replace(/,/g, "");

const doesColonPathMatchPathname = (
  pathInColonForm: string,
  pathname: string,
): boolean => {
  const pathWithoutCommas = removeCommasFromPath(pathname);
  const pathParamsInPathname = new Path(pathInColonForm).test(pathWithoutCommas); // => one of: null, {}, {exampleParam: 'foo'}
  return Boolean(pathParamsInPathname);
};

const doesOpenApiPathMatchPathname = (
  openApiPath: string,
  pathname: string,
): boolean => {
  const pathInColonForm = convertOpenApiPathToColonForm(openApiPath);
  return doesColonPathMatchPathname(pathInColonForm, pathname);
};

export const findOpenApiPathMatchingPossiblePathnames = (
  possiblePathnames: string[],
  OAPaths: string[],
): string => {
  let openApiPath;
  // eslint-disable-next-line no-restricted-syntax
  for (const pathname of possiblePathnames) {
    // eslint-disable-next-line no-restricted-syntax
    for (const OAPath of OAPaths) {
      if (OAPath === pathname) {
        return OAPath;
      }
      if (doesOpenApiPathMatchPathname(OAPath, pathname)) {
        openApiPath = OAPath;
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
