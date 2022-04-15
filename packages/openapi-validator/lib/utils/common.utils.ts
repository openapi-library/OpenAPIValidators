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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  url.parse(request.path).pathname!;

/**
 * Converts all {foo} to :foo
 */
const convertOpenApiPathToColonForm = (openApiPath: string): string =>
  openApiPath.replace(/{/g, ':').replace(/}/g, '');

const doesColonPathMatchPathname = (
  pathInColonForm: string,
  pathname: string,
): boolean => {
  /*
   * By default, OpenAPI path parameters have `style: simple; explode: false` (https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-object)
   * So array path parameters in the pathname of the actual request should be in the form: `/pathParams/a,b,c`
   * `path-parser` fails to match parameter patterns to parameters containing commas.
   * So we remove the commas.
   */
  const pathWithoutCommas = pathname.replace(/,/g, '');
  const pathParamsInPathname = new Path(pathInColonForm).test(
    pathWithoutCommas,
  ); // => one of: null, {}, {exampleParam: 'foo'}
  return Boolean(pathParamsInPathname);
};

const doesOpenApiPathMatchPathname = (
  openApiPath: string,
  pathname: string,
): boolean => {
  const pathInColonForm = convertOpenApiPathToColonForm(openApiPath);
  return doesColonPathMatchPathname(pathInColonForm, pathname);
};

const compareOpenApiPathsByGenericity = (openApiPath1, openApiPath2) => {
  // genericity is a based on the idea that a path with a template parameters is more generic
  // than a path without any template parameter
  // simple examples:
  //  "/a" == "/b"
  //  "/{foo}" == "/{bar}"
  //  "/{foo}" > "/a"
  //  "/a" < "/{foo}"
  // examples with templated prefix:
  //  "/{hello}/a" == "/{bye}/b"
  //  "/{hello}/{foo}" == "/{bye}/{bar}"
  //  "/{hello}/{foo}" > "/{bye}/a"
  //  "/{hello}/a" < "/{bye}/{foo}"
  // examples with hardcoded prefix:
  //  "/hello/a" == "/bye/b"
  //  "/hello/{foo}" == "/bye/{bar}"
  //  "/hello/{foo}" > "/bye/a"
  //  "/hello/a" < "/bye/{foo}"
  const pathElements1 = openApiPath1.substring(1).split(/\//);
  const pathElements2 = openApiPath2.substring(1).split(/\//);
  for (let i = 0; i < pathElements1.length && i < pathElements2.length; i++) {
    const isTemplateElement1 = pathElements1[i][0] == '{';
    const isTemplateElement2 = pathElements2[i][0] == '{';
    if (isTemplateElement1 && !isTemplateElement2) {
      return 1;
    } else if (!isTemplateElement1 && isTemplateElement2) {
      return -1;
    }
  }
  // returning 0 is valid because this function is called  with paths of the same length,
  // so we don't have to compare "/{foo}/a" and "/{bar}" for instance.
  return 0;
};

export const findOpenApiPathMatchingPossiblePathnames = (
  possiblePathnames: string[],
  OAPaths: string[],
): string | undefined => {
  let openApiPath: string | undefined;
  // eslint-disable-next-line no-restricted-syntax
  for (const pathname of possiblePathnames) {
    // eslint-disable-next-line no-restricted-syntax
    for (const OAPath of OAPaths) {
      if (OAPath === pathname) {
        return OAPath;
      }
      if (doesOpenApiPathMatchPathname(OAPath, pathname)) {
        // favor OAPath if it is least generic than openApiPath
        if (
          !openApiPath ||
          compareOpenApiPathsByGenericity(OAPath, openApiPath) < 0
        ) {
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
