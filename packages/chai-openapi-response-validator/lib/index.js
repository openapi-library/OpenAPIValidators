const { openApiSpecFactory } = require('openapi-validator');
const satisfyApiSpec = require('./assertions/satisfyApiSpec');
const satisfySchemaInApiSpec = require('./assertions/satisfySchemaInApiSpec');

module.exports = function (filepathOrObject) {
  const openApiSpec = openApiSpecFactory.makeApiSpec(filepathOrObject);
  return function (chai) {
    satisfyApiSpec(chai, openApiSpec);
    satisfySchemaInApiSpec(chai, openApiSpec);
  };
};
