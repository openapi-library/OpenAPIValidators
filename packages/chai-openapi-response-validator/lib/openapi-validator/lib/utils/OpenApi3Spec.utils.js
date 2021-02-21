const generateCombinations = require('combos');
const flatMap = require('lodash.flatmap');

const unique = (array) => [...new Set(array)];

const serversPropertyNotProvidedOrIsEmptyArray = (spec) =>
  !Object.prototype.hasOwnProperty.call(spec, 'servers') ||
  !spec.servers.length;

const defaultBasePath = '/';

const getBasePath = (url) => {
  const basePathStartIndex = url.replace('//', '  ').indexOf('/');
  return basePathStartIndex !== -1
    ? url.slice(basePathStartIndex)
    : defaultBasePath;
};

const getPathnameWithoutBasePath = (basePath, pathname) =>
  basePath === defaultBasePath ? pathname : pathname.replace(basePath, '');

const mapServerVariableToPossibleValues = (serverVariables) =>
  Object.entries(serverVariables).reduce((currentMap, serverVariable) => {
    const [
      variableName,
      { default: defaultValue, enum: enumMembers },
    ] = serverVariable;
    const possibleValues = enumMembers
      ? unique([defaultValue].concat(enumMembers))
      : [defaultValue];
    return { ...currentMap, [variableName]: possibleValues };
  }, {});

const getPossibleBasePath = (basePath, combinationOfBasePathVariableValues) => {
  return Object.entries(combinationOfBasePathVariableValues).reduce(
    (currentBasePath, [variableName, variableValue]) =>
      currentBasePath.replace(`{${variableName}}`, variableValue),
    basePath,
  );
};

const getPossibleValuesOfBasePathTemplate = (basePath, serverVariables) => {
  const mapOfServerVariablesToPossibleValues = mapServerVariableToPossibleValues(
    serverVariables,
  );
  const combinationsOfBasePathVariableValues = generateCombinations(
    mapOfServerVariablesToPossibleValues,
  );
  const possibleBasePaths = combinationsOfBasePathVariableValues.map(
    (combination) => getPossibleBasePath(basePath, combination),
  );
  return possibleBasePaths;
};

const getServersAndTheirPossibleBasePaths = (servers) =>
  flatMap(servers, ({ url, variables }) => {
    const basePath = getBasePath(url);
    return {
      url,
      possibleBasePaths: variables
        ? getPossibleValuesOfBasePathTemplate(basePath, variables)
        : [basePath],
    };
  });

const getMatchingServersAndTheirBasePaths = (servers, pathname) => {
  const matchesPathname = (basePath) => pathname.startsWith(basePath);
  return getServersAndTheirPossibleBasePaths(servers)
    .filter(({ possibleBasePaths }) => possibleBasePaths.some(matchesPathname))
    .map(({ url, possibleBasePaths }) => ({
      url,
      matchingBasePath: possibleBasePaths.find(matchesPathname),
    }));
};

module.exports = {
  defaultBasePath,
  getBasePath,
  serversPropertyNotProvidedOrIsEmptyArray,
  getPathnameWithoutBasePath,
  getMatchingServersAndTheirBasePaths,
};
