const generateCombinations = require('combos');
const { defaultBasePath } = require('./common.utils');

const unique = (array) => [...new Set(array)];

const serversPropertyNotProvidedOrIsEmptyArray = (spec) =>
  !Object.prototype.hasOwnProperty.call(spec, 'servers') ||
  !spec.servers.length;

const getBasePath = (url) => {
  const basePathStartIndex = url.replace('//', '  ').indexOf('/');
  return basePathStartIndex !== -1
    ? url.slice(basePathStartIndex)
    : defaultBasePath;
};

const getPossibleValuesOfServerVariable = ({
  default: defaultValue,
  enum: enumMembers,
}) =>
  enumMembers ? unique([defaultValue].concat(enumMembers)) : [defaultValue];

const mapServerVariablesToPossibleValues = (serverVariables) =>
  Object.entries(serverVariables).reduce(
    (currentMap, [variableName, detailsOfPossibleValues]) => ({
      ...currentMap,
      [variableName]: getPossibleValuesOfServerVariable(
        detailsOfPossibleValues,
      ),
    }),
    {},
  );

const convertTemplateExpressionToConcreteExpression = (
  templateExpression,
  mapOfVariablesToValues,
) =>
  Object.entries(mapOfVariablesToValues).reduce(
    (currentExpression, [variable, value]) =>
      currentExpression.replace(`{${variable}}`, value),
    templateExpression,
  );

const getPossibleConcreteBasePaths = (basePath, serverVariables) => {
  const mapOfServerVariablesToPossibleValues = mapServerVariablesToPossibleValues(
    serverVariables,
  );
  const combinationsOfBasePathVariableValues = generateCombinations(
    mapOfServerVariablesToPossibleValues,
  );
  const possibleBasePaths = combinationsOfBasePathVariableValues.map(
    (mapOfVariablesToValues) =>
      convertTemplateExpressionToConcreteExpression(
        basePath,
        mapOfVariablesToValues,
      ),
  );
  return possibleBasePaths;
};

const getPossibleBasePaths = (url, serverVariables) => {
  const basePath = getBasePath(url);
  return serverVariables
    ? getPossibleConcreteBasePaths(basePath, serverVariables)
    : [basePath];
};

const getMatchingServerUrlsAndServerBasePaths = (servers, pathname) => {
  const matchesPathname = (basePath) => pathname.startsWith(basePath);
  return servers
    .map(({ url: templatedUrl, variables }) => ({
      templatedUrl,
      possibleBasePaths: getPossibleBasePaths(templatedUrl, variables),
    }))
    .filter(({ possibleBasePaths }) => possibleBasePaths.some(matchesPathname))
    .map(({ templatedUrl, possibleBasePaths }) => {
      const matchingBasePath = possibleBasePaths.find(matchesPathname);
      return {
        concreteUrl: templatedUrl.replace(
          getBasePath(templatedUrl),
          matchingBasePath,
        ),
        matchingBasePath,
      };
    });
};

module.exports = {
  serversPropertyNotProvidedOrIsEmptyArray,
  getMatchingServerUrlsAndServerBasePaths,
};
