import chai from 'chai';
import path from 'path';
import fs from 'fs-extra';

import chaiResponseValidator from '..';

const { expect } = chai;
const invalidArgErrorMessage =
  'The provided argument must be either an absolute filepath or an object representing an OpenAPI specification.';

describe('chaiResponseValidator(stringOrObject)', () => {
  describe('number', () => {
    it('throws an error', () => {
      const func = () => chaiResponseValidator(123 as never);
      expect(func).to.throw(invalidArgErrorMessage);
    });
  });

  describe('array', () => {
    it('throws an error', () => {
      const func = () => chaiResponseValidator([] as never);
      expect(func).to.throw(invalidArgErrorMessage);
    });
  });

  describe('object that is not an OpenAPI spec', () => {
    it('throws an error', () => {
      const func = () => chaiResponseValidator({} as never);
      expect(func).to.throw('Invalid OpenAPI spec: [');
    });
  });

  describe('object that is an incomplete OpenAPI spec', () => {
    it('throws an error', () => {
      const func = () => chaiResponseValidator({ openapi: '3.0.0' } as never);
      expect(func).to.throw('Invalid OpenAPI spec: [');
    });
  });

  describe('object representing a valid OpenAPI spec', () => {
    it('returns a function', () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.json',
      );
      const apiSpec = fs.readJSONSync(pathToApiSpec);
      expect(chaiResponseValidator(apiSpec)).to.be.a('function');
    });
  });

  describe('non-absolute path', () => {
    it('throws an error', () => {
      const func = () => chaiResponseValidator('./');
      expect(func).to.throw(
        `${invalidArgErrorMessage}\nError: './' is not an absolute filepath`,
      );
    });
  });

  describe('absolute path to a non-existent file', () => {
    it('throws an error', () => {
      const func = () => chaiResponseValidator('/non-existent-file.yml');
      expect(func).to.throw(
        `${invalidArgErrorMessage}\nError: ENOENT: no such file or directory, open '/non-existent-file.yml'`,
      );
    });
  });

  describe('absolute path to a file that is neither YAML nor JSON', () => {
    it('throws an error', () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/neitherYamlNorJson.js',
      );
      const func = () => chaiResponseValidator(pathToApiSpec);
      expect(func).to.throw(
        `${invalidArgErrorMessage}\nError: Invalid YAML or JSON:\n`,
      );
    });
  });

  describe('absolute path to an invalid OpenAPI file', () => {
    describe('YAML file that is empty', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/emptyYaml.yml',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw(
          "Invalid OpenAPI spec: Cannot read property 'swagger' of undefined",
        );
      });
    });
    describe('YAML file that is invalid YAML', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidYamlFormat.yml',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw(
          `${invalidArgErrorMessage}\nError: Invalid YAML or JSON:\nduplicated mapping key`,
        );
      });
    });
    describe('JSON file that is invalid JSON', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidJsonFormat.json',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw(
          `${invalidArgErrorMessage}\nError: Invalid YAML or JSON:\nduplicated mapping key`,
        );
      });
    });
    describe('YAML file that is invalid OpenAPI 3', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/openApi/openApi3.yml',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw('Invalid OpenAPI spec:');
      });
    });
    describe('JSON file that is invalid OpenAPI 2', () => {
      it('throws an error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/openApi/openApi2.json',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw('Invalid OpenAPI spec:');
      });
    });
  });

  describe('absolute path to a valid OpenAPI file', () => {
    describe('YAML', () => {
      it('returns a function', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.yml',
        );
        expect(chaiResponseValidator(pathToApiSpec)).to.be.a('function');
      });
    });
    describe('JSON', () => {
      it('returns a function', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.json',
        );
        expect(chaiResponseValidator(pathToApiSpec)).to.be.a('function');
      });
    });
  });
});
