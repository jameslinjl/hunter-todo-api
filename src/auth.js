const express = require('express');
const router = express.Router();

const db = require('./db');
const knex = db.knex;
const getTimeSeconds = () => Math.round(new Date().getTime() / 1000);
const TOKEN_EXPIRATION_SECONDS = 1800;

const hideAuthToken = (rawToken) => {
  const intermediateToken = Buffer.from(rawToken).toString('base64');
  return Buffer.from(intermediateToken).toString('base64');
};

const revealAuthToken = (hiddenAuthToken) => {
  const intermediateToken = Buffer.from(hiddenAuthToken, 'base64').toString('ascii');
  return Buffer.from(intermediateToken, 'base64').toString('ascii');
};

const gateMiddleware = (req, res, next) => {
  const token = req.get('authorization') || req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'operation is not authorized' });
  }

  const revealedToken = revealAuthToken(token);

  const splitToken = revealedToken.split(':');
  if (splitToken.length !== 2) {
    return res.status(401).json({ error: 'operation is not authorized' });
  }

  const [userId, expiration] = splitToken;

  // check to see if the token is still valid
  if (parseInt(expiration) < getTimeSeconds()) {
    return res.status(401).json({ error: 'operation is not authorized' });
  }

  // check to see if the user exists
  knex(db.USER_TABLE_NAME)
    .where({ id: userId })
    .then((rows) => {
      if (rows.length > 0) {
        res.locals.userId = userId;
        next();
      } else {
        return res.status(401).json({ error: 'operation is not authorized' });
      }
    })
    .catch((e) => {
      console.error(e);
      return res.status(500).json({ error: 'something weird happened with the API. contact james' });
    });
};

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

    // generate (simple / trivial) token and return
    const token = hideAuthToken(
      `${usernameCheckRows[0].id}:${(getTimeSeconds() + TOKEN_EXPIRATION_SECONDS).toString()}`
    );
    return res.header('set-cookie', `token=${token}`).json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'something weird happened with the API. contact james' });
  }
});

module.exports = {
  router,
  gateMiddleware,
};
