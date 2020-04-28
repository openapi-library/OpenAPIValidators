/** *****************************************************************************
 * Copyright 2019 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ****************************************************************************** */

const chai = require('chai');
const path = require('path');
const fs = require('fs-extra');
const chaiResponseValidator = require('..');

const { expect } = chai;
const genericArgTypeErrMsg = 'The provided argument must be either an absolute filepath or'
 + ' an object representing an OpenAPI specification.\nError details: ';

describe('chaiResponseValidator(pathToApiSpec)', function () {
  describe('neither string nor object', function () {
    describe('number', function () {
      it('throws a relevant error', function () {
        const func = () => chaiResponseValidator(123);
        expect(func).to.throw(`${genericArgTypeErrMsg}Received type 'number'`);
      });
    });
    describe('array', function () {
      it('throws a relevant error', function () {
        const func = () => chaiResponseValidator([]);
        expect(func).to.throw(`${genericArgTypeErrMsg}Received type 'array'`);
      });
    });
  });

  describe('non-absolute path', function () {
    it('throws a relevant error', function () {
      const func = () => chaiResponseValidator('./');
      expect(func).to.throw(`${genericArgTypeErrMsg}'./' is not an absolute filepath`);
    });
  });

  describe('absolute path to a non-existent file', function () {
    it('throws a relevant error', function () {
      const func = () => chaiResponseValidator('/non-existent-file.yml');
      expect(func).to.throw(`${genericArgTypeErrMsg}ENOENT: no such file or directory, open '/non-existent-file.yml'`);
    });
  });

  describe('absolute path to a file that is neither YAML nor JSON', function () {
    it('throws a relevant error', function () {
      const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/neitherYamlNorJson.js');
      const func = () => chaiResponseValidator(pathToApiSpec);
      expect(func).to.throw(`${genericArgTypeErrMsg}Invalid YAML or JSON:\n`);
    });
  });

  describe('absolute path to an invalid OpenAPI file', function () {
    describe('YAML file that is empty', function () {
      it('throws a relevant error', function () {
        const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/emptyYaml.yml');
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw('Invalid OpenAPI spec: Cannot read property \'swagger\' of undefined');
      });
    });
    describe('YAML file that is invalid YAML', function () {
      it('throws a relevant error', function () {
        const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidYamlFormat.yml');
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw(`${genericArgTypeErrMsg}Invalid YAML or JSON:\nduplicated mapping key`);
      });
    });
    describe('JSON file that is invalid JSON', function () {
      it('throws a relevant error', function () {
        const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/invalid/fileFormat/invalidJsonFormat.json');
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw(`${genericArgTypeErrMsg}Invalid YAML or JSON:\nduplicated mapping key`);
      });
    });
    describe('YAML file that is invalid OpenAPI 3', function () {
      it('throws a relevant error', function () {
        const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/invalid/openApi/openApi3.yml');
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw('Invalid OpenAPI spec:');
      });
    });
    describe('JSON file that is invalid OpenAPI 2', function () {
      it('throws a relevant error', function () {
        const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/invalid/openApi/openApi2.json');
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw('Invalid OpenAPI spec:');
      });
    });
  });

  describe('absolute path to a valid OpenAPI file', function () {
    describe('YAML', function () {
      it('returns a function', function () {
        const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/valid/openapi3.yml');
        expect(chaiResponseValidator(pathToApiSpec)).to.be.a('function');
      });
    });
    describe('JSON', function () {
      it('returns a function', function () {
        const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/valid/openapi3.json');
        expect(chaiResponseValidator(pathToApiSpec)).to.be.a('function');
      });
    });
  });

  describe('object representing a valid OpenAPI file', function () {
    it('returns a function', function () {
      const pathToApiSpec = path.resolve('../../commonTestResources/exampleOpenApiFiles/valid/openapi3.json');
      const apiSpec = fs.readJSONSync(pathToApiSpec);
      expect(chaiResponseValidator(apiSpec)).to.be.a('function');
    });
  });
  describe('object not representing a valid OpenAPI file', function () {
    it('throws a relevant error', function () {
      const func = () => chaiResponseValidator({ foo: 'foo' });
      expect(func).to.throw('Invalid OpenAPI spec: [');
    });
  });
});
