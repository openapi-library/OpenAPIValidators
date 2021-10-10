import generateCombinations from 'combos';
import type { OpenAPIV3 } from 'openapi-types';
import { defaultBasePath } from './common.utils';

type ServerVariables = OpenAPIV3.ServerObject['variables'];

const unique = <T>(array: T[]): T[] => [...new Set(array)];

export const serversPropertyNotProvidedOrIsEmptyArray = (
  spec: OpenAPIV3.Document,
): boolean => !spec.servers || !spec.servers.length;

const getBasePath = (url: string): string => {
  const basePathStartIndex = url.replace('//', '  ').indexOf('/');
  return basePathStartIndex !== -1
    ? url.slice(basePathStartIndex)
    : defaultBasePath;
};

const getPossibleValuesOfServerVariable = ({
  default: defaultValue,
  enum: enumMembers,
}: OpenAPIV3.ServerVariableObject): string[] =>
  enumMembers ? unique([defaultValue].concat(enumMembers)) : [defaultValue];

const mapServerVariablesToPossibleValues = (
  serverVariables: NonNullable<ServerVariables>,
): Record<string, string[]> =>
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
  templateExpression: string,
  mapOfVariablesToValues: Record<string, string>,
) =>
  Object.entries(mapOfVariablesToValues).reduce(
    (currentExpression, [variable, value]) =>
      currentExpression.replace(`{${variable}}`, value),
    templateExpression,
  );

const getPossibleConcreteBasePaths = (
  basePath: string,
  serverVariables: NonNullable<ServerVariables>,
): string[] => {
  const mapOfServerVariablesToPossibleValues =
    mapServerVariablesToPossibleValues(serverVariables);
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

const getPossibleBasePaths = (
  url: string,
  serverVariables: ServerVariables,
): string[] => {
  const basePath = getBasePath(url);
  return serverVariables
    ? getPossibleConcreteBasePaths(basePath, serverVariables)
    : [basePath];
};

export const getMatchingServerUrlsAndServerBasePaths = (
  servers: OpenAPIV3.ServerObject[],
  pathname: string,
): { concreteUrl: string; matchingBasePath: string }[] => {
  const matchesPathname = (basePath: string): boolean =>
    pathname.startsWith(basePath);
  return servers
    .map(({ url: templatedUrl, variables }) => ({
      templatedUrl,
      possibleBasePaths: getPossibleBasePaths(templatedUrl, variables),
    }))
    .filter(({ possibleBasePaths }) => possibleBasePaths.some(matchesPathname))
    .map(({ templatedUrl, possibleBasePaths }) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const matchingBasePath = possibleBasePaths.find(matchesPathname)!;
      return {
        concreteUrl: templatedUrl.replace(
          getBasePath(templatedUrl),
          matchingBasePath,
        ),
        matchingBasePath,
      };
    });
};
