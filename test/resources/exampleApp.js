const express = require('express');
const { port } = require('../config');

const app = express();

app.get('/local/test/responseBody/string', (req, res) =>
  res.json('res.body is a string')
);
app.get('/local/test/responseBody/emptyObject', (req, res) =>
  res.send('res.body is an empty object; res.text is a string')
);

app.listen(
  port,
  // () => console.log(`Test app listening on port ${port}.`),
);

module.exports = app;
