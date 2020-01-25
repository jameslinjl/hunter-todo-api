const express = require('express');
const router = express.Router();
const db = require('./db');
const knex = db.knex;
const lodash = require('lodash');

router.post('/user', async (req, res) => {
  const { body } = req;

  if (!body.hasOwnProperty('username')) {
    return res.status(400).json({ error: 'you must supply a field "username" when creating a user' });
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

router.get('/user', (req, res) => {
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

module.exports = {
  router,
};
