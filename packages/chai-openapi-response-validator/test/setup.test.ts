import chai from 'chai';
import path from 'path';
import fs from 'fs-extra';

import chaiResponseValidator from '..';

const { expect } = chai;
const genericArgTypeErrMsg =
  'The provided argument must be either an absolute filepath or an object representing an OpenAPI specification.\nError details: ';

describe('chaiResponseValidator(pathToApiSpec)', () => {
  describe('neither string nor object', () => {
    describe('number', () => {
      it('throws a relevant error', () => {
        const func = () => chaiResponseValidator(123 as any);
        expect(func).to.throw(`${genericArgTypeErrMsg}Received type 'number'`);
      });
    });
    describe('array', () => {
      it('throws a relevant error', () => {
        const func = () => chaiResponseValidator([]);
        expect(func).to.throw(`${genericArgTypeErrMsg}Received type 'array'`);
      });
    });
  });

  describe('non-absolute path', () => {
    it('throws a relevant error', () => {
      const func = () => chaiResponseValidator('./');
      expect(func).to.throw(
        `${genericArgTypeErrMsg}'./' is not an absolute filepath`,
      );
    });
  });

  describe('absolute path to a non-existent file', () => {
    it('throws a relevant error', () => {
      const func = () => chaiResponseValidator('/non-existent-file.yml');
      expect(func).to.throw(
        `${genericArgTypeErrMsg}ENOENT: no such file or directory, open '/non-existent-file.yml'`,
      );
    });
  });

  describe('absolute path to a file that is neither YAML nor JSON', () => {
    it('throws a relevant error', () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/neitherYamlNorJson.js',
      );
      const func = () => chaiResponseValidator(pathToApiSpec);
      expect(func).to.throw(`${genericArgTypeErrMsg}Invalid YAML or JSON:\n`);
    });
  });

  describe('absolute path to an invalid OpenAPI file', () => {
    describe('YAML file that is empty', () => {
      it('throws a relevant error', () => {
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
      it('throws a relevant error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidYamlFormat.yml',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw(
          `${genericArgTypeErrMsg}Invalid YAML or JSON:\nduplicated mapping key`,
        );
      });
    });
    describe('JSON file that is invalid JSON', () => {
      it('throws a relevant error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidJsonFormat.json',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw(
          `${genericArgTypeErrMsg}Invalid YAML or JSON:\nduplicated mapping key`,
        );
      });
    });
    describe('YAML file that is invalid OpenAPI 3', () => {
      it('throws a relevant error', () => {
        const pathToApiSpec = path.resolve(
          '../../commonTestResources/exampleOpenApiFiles/invalid/openApi/openApi3.yml',
        );
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw('Invalid OpenAPI spec:');
      });
    });
    describe('JSON file that is invalid OpenAPI 2', () => {
      it('throws a relevant error', () => {
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

  describe('object representing a valid OpenAPI file', () => {
    it('returns a function', () => {
      const pathToApiSpec = path.resolve(
        '../../commonTestResources/exampleOpenApiFiles/valid/openapi3.json',
      );
      const apiSpec = fs.readJSONSync(pathToApiSpec);
      expect(chaiResponseValidator(apiSpec)).to.be.a('function');
    });
  });
  describe('object not representing a valid OpenAPI file', () => {
    it('throws a relevant error', () => {
      const func = () => chaiResponseValidator({ foo: 'foo' });
      expect(func).to.throw('Invalid OpenAPI spec: [');
    });
  });
});
