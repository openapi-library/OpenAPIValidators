const express = require('express'); // eslint-disable-line import/no-extraneous-dependencies

const app = express();

app.get('/header/application/json/and/responseBody/string', (req, res) =>
  res.json('res.body is a string'),
);

app.get('/header/application/json/and/responseBody/emptyObject', (req, res) =>
  res.send({}),
);

app.get('/header/application/json/and/responseBody/boolean', (req, res) =>
  res.json(false),
);

app.get('/header/application/json/and/responseBody/nullable', (req, res) =>
  res.json(null),
);

app.get('/header/text/html', (req, res) => res.send('res.body is a string'));

app.get('/no/content-type/header/and/no/response/body', (req, res) =>
  res.sendStatus(204),
);

module.exports = app;
