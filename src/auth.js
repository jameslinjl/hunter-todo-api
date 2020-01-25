const express = require('express');
const router = express.Router();

const db = require('./db');
const knex = db.knex;
const getTimeSeconds = () => Math.round(new Date().getTime() / 1000).toString();

router.post('/auth', async (req, res) => {
  // check for username in req -> error if username not provided
  const { body } = req;

  if (!body.hasOwnProperty('username')) {
    return res.status(400).json({ error: 'you must supply a field "username" when authenticating as a user' });
  }

  const { username } = body;

  // check db for username -> error if username doesnt exist in db
  try {
    const usernameCheckRows = await knex(db.USER_TABLE_NAME).where({ username });
    if (usernameCheckRows.length === 0) {
      return res.status(400).json({ error: `username "${username}" does not exist` });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'something weird happened with the API. contact james' });
  }

  // generate (simple / trivial) token and return
  const token = Buffer.from(username + getTimeSeconds()).toString('base64');
  res.header('set-cookie', `token=${token}`).json({ token });
});

module.exports = {
  router,
};
