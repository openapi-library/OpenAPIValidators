const util = require('util');
const PathParser = require('path-parser').default;
const url = require('url');

const isEmptyObj = (obj) =>
  !!obj
  && Object.entries(obj).length === 0
  && obj.constructor === Object;

const stringify = (obj) =>
  util.inspect(
    obj,
    { showHidden: false, depth: null }
  );

const convertOpenApiPathToColonForm = (openApiPath) =>
  openApiPath.replace(/{/g, ':').replace(/}/g, ''); // converts all {foo} to :foo

const doesColonPathMatchPathname = (pathInColonForm, pathname) => {
  const pathParser = new PathParser(pathInColonForm);
  const pathParamsInPathname = pathParser.test(pathname); // => one of: null, {}, {exampleParam: 'foo'}
  return Boolean(pathParamsInPathname);
};

const extractPathname = (actualRequest) => {
  const { pathname } = url.parse(actualRequest.path); // excludes the query (because: path = pathname + query)
  return pathname;
};

module.exports = {
  isEmptyObj,
  stringify,
  convertOpenApiPathToColonForm,
  doesColonPathMatchPathname,
  extractPathname,
};
