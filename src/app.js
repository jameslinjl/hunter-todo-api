const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});
const db = require('./db');
const lodash = require('lodash');

const PORT = process.env.PORT || 3000;

// parse application/json
app.use(bodyParser.json());

// handle JSON syntax errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: 'body must be valid JSON' });
  } else {
    next();
  }
});

app.post('/user', async (req, res) => {
  const { body } = req;

  if (!body.hasOwnProperty('username')) {
    return res.status(400).json({ error: 'you must supply a username when creating a user' });
  }

  const { username } = body;

  try {
    const usernameCheckRows = await knex(db.USER_TABLE_NAME).where({ username });
    if (usernameCheckRows.length > 0) {
      return res.status(400).json({ error: `username "${username}" already exists` });
    }

    await knex(db.USER_TABLE_NAME).insert({ username });

    const responseData = await knex(db.USER_TABLE_NAME).where({ username });
    if (responseData.length === 1) {
      return res.status(201).json(responseData[0]);
    }
    return res.status(500).json({ error: 'something weird happened with the API. contact james' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'something weird happened with the API. contact james' });
  }
});

app.get('/user', (req, res) => {
  const usernameQuery = req.query['username'];
  const selectWhereClause = lodash.isNil(usernameQuery) ? {} : { username: usernameQuery };

  knex(db.USER_TABLE_NAME)
    .where(selectWhereClause)
    .then((rows) => {
      res.status(rows.length > 0 ? 200 : 404).json(rows);
    })
    .catch((e) => {
      console.error(e);
      res.status(500).json({ error: 'something weird happened with the API. contact james' });
    });
});

app.post('/auth', (req, res) => {
  // check for username in req
  // check db for username

  const token = 'asillytoken';
  res.header('set-cookie', `token=${token}`).json({ token });
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
