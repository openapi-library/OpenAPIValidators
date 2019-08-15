/*******************************************************************************
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
 *******************************************************************************/

const chai = require('chai');
const path = require('path');
const chaiResponseValidator = require('../..');

const { expect } = chai;

describe('chaiResponseValidator(pathToApiSpec)', function () {
  describe('with valid \'pathToApiSpec\' (absolute path to a .yml or .json file)', function () {
    describe('valid OpenAPI file', function () {
      describe('YAML', function () {
        it('returns a function', function () {
          const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/valid/openapi3.yml');
          expect(chaiResponseValidator(pathToApiSpec)).to.be.a('function');
        });
      });
      describe('JSON', function () {
        it('returns a function', function () {
          const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/valid/openapi3.json');
          expect(chaiResponseValidator(pathToApiSpec)).to.be.a('function');
        });
      });
    });

    describe('invalid OpenAPI file', function () {
      describe('YAML file that is empty', function () {
        it('throws a relevant error', function () {
          const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/invalid/fileFormat/emptyYaml.yml');
          const func = () => chaiResponseValidator(pathToApiSpec);
          expect(func).to.throw('Error: File is not a valid OpenAPI spec.');
        });
      });
      describe('YAML file that is invalid YAML', function () {
        it('throws a relevant error', function () {
          const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/invalid/fileFormat/invalidYamlFormat.yml');
          const func = () => chaiResponseValidator(pathToApiSpec);
          expect(func).to.throw('Error: Unable to read the specified OpenAPI document. File is invalid YAML or JSON');
        });
      });
      describe('JSON file that is invalid JSON', function () {
        it('throws a relevant error', function () {
          const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/invalid/fileFormat/invalidJsonFormat.json');
          const func = () => chaiResponseValidator(pathToApiSpec);
          expect(func).to.throw('Error: Unable to read the specified OpenAPI document. File is invalid YAML or JSON');
        });
      });
      describe('invalid OpenAPI 3', function () {
        it('throws a relevant error', function () {
          const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/invalid/openApi/openApi3.yml');
          const func = () => chaiResponseValidator(pathToApiSpec);
          expect(func).to.throw('Error: File is not a valid OpenAPI spec');
        });
      });
      describe('invalid OpenAPI 2', function () {
        it('throws a relevant error', function () {
          const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/invalid/openApi/openApi2.json');
          const func = () => chaiResponseValidator(pathToApiSpec);
          expect(func).to.throw('Error: File is not a valid OpenAPI spec');
        });
      });
    });
  });
  describe('with invalid \'pathToApiSpec\'', function () {
    describe('non-string', function () {
      it('throws a relevant error', function () {
        const func = () => chaiResponseValidator(123);
        expect(func).to.throw('The "path" argument must be of type string. Received type number');
      });
    });
    describe('non-absolute path', function () {
      it('throws a relevant error', function () {
        const func = () => chaiResponseValidator('./');
        expect(func).to.throw('The "path" argument must be an absolute path');
      });
    });
    describe('absolute path to a non-existent file', function () {
      it('throws a relevant error', function () {
        const func = () => chaiResponseValidator('/non-existent-file.yml');
        expect(func).to.throw('no such file or directory, open \'/non-existent-file.yml\'');
      });
    });
    describe('absolute path to a file that is neither YAML nor JSON', function () {
      it('throws a relevant error', function () {
        const pathToApiSpec = path.resolve('test/exampleOpenApiFiles/invalid/fileFormat/neitherYamlNorJson.js');
        const func = () => chaiResponseValidator(pathToApiSpec);
        expect(func).to.throw('Error: Unable to read the specified OpenAPI document. File is invalid YAML or JSON');
      });
    });
  });
});
