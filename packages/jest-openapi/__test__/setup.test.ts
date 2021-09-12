import path from 'path';
import fs from 'fs-extra';

import jestOpenAPI from '..';

const invalidArgErrorMessage =
  'The provided argument must be either an absolute filepath or an object representing an OpenAPI specification.\nError details: ';

describe('jestOpenAPI(filepathOrObject)', () => {
  describe('number', () => {
    it('throws an error', () => {
      const func = () => jestOpenAPI(123 as never);
      expect(func).toThrow(`${invalidArgErrorMessage}Received type 'number'`);
    });
  });

  describe('array', () => {
    it('throws an error', () => {
      const func = () => jestOpenAPI([] as never);
      expect(func).toThrow(`${invalidArgErrorMessage}Received type 'array'`);
    });
  });

  describe('object that is not an OpenAPI spec', () => {
    it('throws an error', () => {
      const func = () => jestOpenAPI({} as never);
      expect(func).toThrow('Invalid OpenAPI spec: [');
    });
  });

  describe('object that is an incomplete OpenAPI spec', () => {
    it('throws an error', () => {
      const func = () => jestOpenAPI({ openapi: '3.0.0' } as never);
      expect(func).toThrow('Invalid OpenAPI spec: [');
    });
  });

  describe('object representing a valid OpenAPI spec', () => {
    it("successfully extends jest's `expect`", () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.json',
      );
      const apiSpec = fs.readJSONSync(pathToApiSpec);
      expect(() => jestOpenAPI(apiSpec)).not.toThrow();
    });
  });

  describe('non-absolute path', () => {
    it('throws an error', () => {
      const func = () => jestOpenAPI('./');
      expect(func).toThrow(
        `${invalidArgErrorMessage}'./' is not an absolute filepath`,
      );
    });
  });

  describe('absolute path to a non-existent file', () => {
    it('throws an error', () => {
      const func = () => jestOpenAPI('/non-existent-file.yml');
      expect(func).toThrow(
        `${invalidArgErrorMessage}ENOENT: no such file or directory, open '/non-existent-file.yml'`,
      );
    });
  });

  describe('absolute path to a file that is neither YAML nor JSON', () => {
    it('throws an error', () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/neitherYamlNorJson.js',
      );
      const func = () => jestOpenAPI(pathToApiSpec);
      expect(func).toThrow(`${invalidArgErrorMessage}Invalid YAML or JSON:\n`);
    });
  });

  describe('absolute path to an invalid OpenAPI file', () => {
    describe('YAML file that is empty', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/emptyYaml.yml',
        );
        const func = () => jestOpenAPI(pathToApiSpec);
        expect(func).toThrow(
          "Invalid OpenAPI spec: Cannot read property 'swagger' of undefined",
        );
      });
    });
    describe('YAML file that is invalid YAML', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidYamlFormat.yml',
        );
        const func = () => jestOpenAPI(pathToApiSpec);
        expect(func).toThrow(
          `${invalidArgErrorMessage}Invalid YAML or JSON:\nduplicated mapping key`,
        );
      });
    });
    describe('JSON file that is invalid JSON', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidJsonFormat.json',
        );
        const func = () => jestOpenAPI(pathToApiSpec);
        expect(func).toThrow(
          `${invalidArgErrorMessage}Invalid YAML or JSON:\nduplicated mapping key`,
        );
      });
    });
    describe('YAML file that is invalid OpenAPI 3', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/openApi/openApi3.yml',
        );
        const func = () => jestOpenAPI(pathToApiSpec);
        expect(func).toThrow('Invalid OpenAPI spec:');
      });
    });
    describe('JSON file that is invalid OpenAPI 2', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/openApi/openApi2.json',
        );
        const func = () => jestOpenAPI(pathToApiSpec);
        expect(func).toThrow('Invalid OpenAPI spec:');
      });
    });
  });

  describe('absolute path to a valid OpenAPI YAML file', () => {
    it("successfully extends jest's `expect`", () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.yml',
      );
      expect(() => jestOpenAPI(pathToApiSpec)).not.toThrow();
    });
  });

  describe('absolute path to a valid OpenAPI JSON file', () => {
    it("successfully extends jest's `expect`", () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.json',
      );
      expect(() => jestOpenAPI(pathToApiSpec)).not.toThrow();
    });
  });
});
