import { inspect } from 'util';
import { Path as PathParser } from 'path-parser';
import url from 'url';
import type { OpenAPIPath } from './classes/AbstractOpenApiSpec.types';

export type Pathname = URL['pathname'];

export const isEmptyObj = (obj) =>
  !!obj && Object.entries(obj).length === 0 && obj.constructor === Object;

export const stringify = (obj) => inspect(obj, { depth: null });

export const extractPathname = (actualRequest) => {
  const { pathname } = url.parse(actualRequest.path); // excludes the query (because: path = pathname + query)
  return pathname;
};

const convertOpenApiPathToColonForm = (openApiPath) =>
  openApiPath.replace(/{/g, ':').replace(/}/g, ''); // converts all {foo} to :foo

const doesColonPathMatchPathname = (
  pathInColonForm: string,
  pathname: Pathname,
) => {
  const pathParser = new PathParser(pathInColonForm);
  const pathParamsInPathname = pathParser.test(pathname); // => one of: null, {}, {exampleParam: 'foo'}
  return Boolean(pathParamsInPathname);
};

const doesOpenApiPathMatchPathname = (
  openApiPath: OpenAPIPath,
  pathname: Pathname,
) => {
  const pathInColonForm = convertOpenApiPathToColonForm(openApiPath);
  return doesColonPathMatchPathname(pathInColonForm, pathname);
};

export const findOpenApiPathMatchingPossiblePathnames = (
  possiblePathnames: Pathname[],
  OAPaths: OpenAPIPath[],
): OpenAPIPath => {
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
