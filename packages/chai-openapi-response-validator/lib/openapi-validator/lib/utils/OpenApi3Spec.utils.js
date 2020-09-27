const generateCombinations = require('combos');
const flatMap = require('lodash.flatmap');

const serversPropertyNotProvidedOrIsEmptyArray = (spec) =>
  !Object.prototype.hasOwnProperty.call(spec, 'servers') ||
  !spec.servers.length;

const defaultBasePath = '/';

const extractBasePath = (inputUrl) => {
  const indexOfStartOfBasePath = inputUrl.replace('//', '  ').indexOf('/');
  return indexOfStartOfBasePath !== -1
    ? inputUrl.slice(indexOfStartOfBasePath)
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
      ? [...new Set([defaultValue].concat(enumMembers))]
      : [defaultValue];
    return {
      ...currentMap,
      [variableName]: possibleValues,
    };
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
  flatMap(servers, (server) => {
    const basePath = extractBasePath(server.url);
    return {
      url: server.url,
      possibleBasePaths: server.variables
        ? getPossibleValuesOfBasePathTemplate(basePath, server.variables)
        : [basePath],
    };
  });

const getMatchingServersAndTheirBasePaths = (servers, pathnameToMatch) =>
  getServersAndTheirPossibleBasePaths(servers)
    .filter(({ possibleBasePaths }) =>
      possibleBasePaths.some((basePath) =>
        pathnameToMatch.startsWith(basePath),
      ),
    )
    .map(({ url, possibleBasePaths }) => ({
      url,
      matchingBasePath: possibleBasePaths.find((basePath) =>
        pathnameToMatch.startsWith(basePath),
      ),
    }));

module.exports = {
  defaultBasePath,
  extractBasePath,
  serversPropertyNotProvidedOrIsEmptyArray,
  getPathnameWithoutBasePath,
  getMatchingServersAndTheirBasePaths,
};
