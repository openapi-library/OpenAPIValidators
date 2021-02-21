const { inspect } = require('util');
const { Path: PathParser } = require('path-parser');
const url = require('url');

const stringify = (obj) => inspect(obj, { depth: null });

// excludes the query because path = pathname + query
const getPathname = (request) => url.parse(request.path).pathname;

// converts all {foo} to :foo
const convertOpenApiPathToColonForm = (openApiPath) =>
  openApiPath.replace(/{/g, ':').replace(/}/g, '');

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

module.exports = {
  stringify,
  getPathname,
  findOpenApiPathMatchingPossiblePathnames,
};
