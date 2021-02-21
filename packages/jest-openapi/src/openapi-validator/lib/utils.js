const { inspect } = require('util');
const { Path: PathParser } = require('path-parser');
const url = require('url');

const isEmptyObj = (obj) =>
  !!obj && Object.entries(obj).length === 0 && obj.constructor === Object;

const stringify = (obj) => inspect(obj, { depth: null });

const extractPathname = (actualRequest) => {
  const { pathname } = url.parse(actualRequest.path); // excludes the query (because: path = pathname + query)
  return pathname;
};

const convertOpenApiPathToColonForm = (openApiPath) =>
  openApiPath.replace(/{/g, ':').replace(/}/g, ''); // converts all {foo} to :foo

const doesColonPathMatchPathname = (pathInColonForm, pathname) => {
  const pathParser = new PathParser(pathInColonForm);
  const pathParamsInPathname = pathParser.test(pathname); // => one of: null, {}, {exampleParam: 'foo'}
  return Boolean(pathParamsInPathname);
};

const doesOpenApiPathMatchPathname = (openApiPath, pathname) => {
  const pathInColonForm = convertOpenApiPathToColonForm(openApiPath);
  return doesColonPathMatchPathname(pathInColonForm, pathname);
};

const findOpenApiPathMatchingPossiblePathnames = (
  possiblePathnames,
  OAPaths,
) => {
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

const getPathnameWithoutBasePath = (basePath, pathname) =>
  basePath === '/' ? pathname : pathname.replace(basePath, '');

module.exports = {
  isEmptyObj,
  stringify,
  extractPathname,
  findOpenApiPathMatchingPossiblePathnames,
  getPathnameWithoutBasePath,
};
