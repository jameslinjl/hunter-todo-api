const express = require('express');
const router = express.Router();
const db = require('./db');
const knex = db.knex;
const lodash = require('lodash');
const S3 = require('aws-sdk/clients/s3');

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
    .orderBy('id')
    .then((rows) => {
      res.status(rows.length > 0 ? 200 : 404).json(rows);
    })
    .catch((e) => {
      console.error(e);
      res.status(500).json({ error: 'something weird happened with the API. contact james' });
    });
});

router.get('/user/:id', (req, res) => {
  knex(db.USER_TABLE_NAME)
    .where({ id: req.params.id })
    .then((rows) => {
      if (rows.length === 1) {
        const row = rows[0];
        return res.json(row);
      } else {
        return res.status(404).json({ error: `no user found with id "${req.params.id}"` });
      }
    })
    .catch((e) => {
      console.error(e);
      return res.status(500).json({ error: 'something weird happened with the API. contact james' });
    });
});

const cfDomain = process.env.AWS_CF_DOMAIN;
const s3 = new S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});
const Bucket = 'todo-user-profile-pic-image';

router.put('/user/:id/upload-profile-picture', async (req, res) => {
  const whereClause = { id: req.params.id };
  const rows = await knex(db.USER_TABLE_NAME).where(whereClause);
  if (rows.length !== 1) {
    return res.status(404).json({ error: `no user found with id "${req.params.id}"` });
  }

  const fileExtensionMatch = req.files.image.name.match(/\.([a-zA-Z])+$/);
  const fileExtension = fileExtensionMatch ? fileExtensionMatch[0] : '';
  const profilePicturePath = `${req.params.id}${fileExtension}`;
  s3.putObject({ Bucket, Body: req.files.image.data, Key: profilePicturePath }, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'unable to upload image to AWS S3. contact james' });
    }
    knex(db.USER_TABLE_NAME)
      .where(whereClause)
      .update({ profile_picture_url: `https://${cfDomain}/${profilePicturePath}` })
      .then(() => {
        return knex(db.USER_TABLE_NAME).where(whereClause);
      })
      .then((data) => {
        return res.json(data);
      })
      .catch((e) => {
        console.error(e);
        res.status(500).json({ error: 'something weird happened with the API. contact james' });
      });
  });
});

module.exports = {
  router,
};
