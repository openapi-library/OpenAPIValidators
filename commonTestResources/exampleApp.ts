import express, { Express } from 'express'; // eslint-disable-line import/no-extraneous-dependencies

const app = express() as Express & {
  server: ReturnType<Express['listen']>;
};

app.get('/header/application/json/and/responseBody/string', (_req, res) =>
  res.json('res.body is a string'),
);

app.get('/header/application/json/and/responseBody/emptyObject', (_req, res) =>
  res.send({}),
);

app.get('/header/application/json/and/responseBody/boolean', (_req, res) =>
  res.json(false),
);

app.get('/header/application/json/and/responseBody/nullable', (_req, res) =>
  res.json(null),
);

app.get('/header/text/html', (_req, res) => res.send('res.body is a string'));

app.get('/no/content-type/header/and/no/response/body', (_req, res) =>
  res.sendStatus(204),
);

export default app;

export const port = 5000;
