const express = require('express');
const { port } = require('../config');

const app = express();

app.get('/local/test/responseBody/string', (req, res) =>
  res.json('valid body (string)')
);
app.get('/local/test/responseBody/emptyObject', (req, res) =>
  res.send('valid body (empty object)')
);

app.listen(
  port,
  // () => console.log(`Test app listening on port ${port}.`) // eslint-disable-line no-console
);

module.exports = app;
