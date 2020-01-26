const express = require('express');
const router = express.Router();
const db = require('./db');
const knex = db.knex;

router.get('/todo-item', (req, res) => {
  knex(db.TODO_ITEM_TABLE_NAME)
    .where({ user_id: res.locals.userId })
    .then((rows) => {
      if (rows.length > 0) {
        return res.json(rows);
      } else {
        return res.status(404).json(rows);
      }
    })
    .catch((e) => {
      console.error(e);
      return res.status(500).json({ error: 'something weird happened with the API. contact james' });
    });
});

module.exports = {
  router,
};
