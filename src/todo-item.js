const express = require('express');
const router = express.Router();
const db = require('./db');
const knex = db.knex;

router.get('/todo-item', (req, res) => {
  knex(db.TODO_ITEM_TABLE_NAME)
    .where({ user_id: res.locals.userId })
    .orderBy('id')
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

router.get('/todo-item/:id', (req, res) => {
  knex(db.TODO_ITEM_TABLE_NAME)
    .where({ id: req.params.id })
    .then((rows) => {
      if (rows.length === 1) {
        const row = rows[0];
        if (row.user_id !== parseInt(res.locals.userId)) {
          return res.status(401).json({ error: 'operation is not authorized' });
        }
        return res.json(row);
      } else {
        return res.status(404).json({ error: `no todo-item found with id "${req.params.id}"` });
      }
    })
    .catch((e) => {
      console.error(e);
      return res.status(500).json({ error: 'something weird happened with the API. contact james' });
    });
});

router.put('/todo-item/:id', async (req, res) => {
  try {
    const rows = await knex(db.TODO_ITEM_TABLE_NAME).where({ id: req.params.id });
    if (rows.length !== 1) {
      return res.status(404).json({ error: `no todo-item found with id "${req.params.id}"` });
    }

    const row = rows[0];
    if (row.user_id !== parseInt(res.locals.userId)) {
      return res.status(401).json({ error: 'operation is not authorized' });
    }
    if (row.deleted === true) {
      return res.status(400).json({ error: 'cannot edit a deleted todo-item' });
    }

    const { body } = req;

    if (!body.hasOwnProperty('content') && !body.hasOwnProperty('completed')) {
      return res
        .status(400)
        .json({ error: 'you must supply at least "content" or "completed" field when editing a todo-item' });
    }

    const { content, completed } = body;
    if (content !== undefined && typeof content !== 'string') {
      return res.status(400).json({ error: '"content" of todo-item must be a string' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: '"completed" of todo-item must be a boolean' });
    }
    const newBody = {
      content: content !== undefined ? content : row.content,
      completed: completed !== undefined ? completed : row.completed,
    };

    await knex(db.TODO_ITEM_TABLE_NAME)
      .where({ id: req.params.id })
      .update(newBody);
    const updatedData = await knex(db.TODO_ITEM_TABLE_NAME).where({ id: req.params.id });
    return res.json(updatedData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'something weird happened with the API. contact james' });
  }
});

router.delete('/todo-item/:id', async (req, res) => {
  try {
    const rows = await knex(db.TODO_ITEM_TABLE_NAME).where({ id: req.params.id });
    if (rows.length !== 1) {
      return res.status(404).json({ error: `no todo-item found with id "${req.params.id}"` });
    }

    const row = rows[0];
    if (row.user_id !== parseInt(res.locals.userId)) {
      return res.status(401).json({ error: 'operation is not authorized' });
    }
    if (row.deleted === true) {
      return res.status(400).json({ error: 'todo-item is already deleted' });
    }

    await knex(db.TODO_ITEM_TABLE_NAME)
      .where({ id: req.params.id })
      .update({ deleted: true });
    const updatedData = await knex(db.TODO_ITEM_TABLE_NAME).where({ id: req.params.id });
    return res.json(updatedData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'something weird happened with the API. contact james' });
  }
});

router.post('/todo-item', async (req, res) => {
  const { body } = req;

  if (!body.hasOwnProperty('content')) {
    return res.status(400).json({ error: 'you must supply a field "content" when creating a todo-item' });
  }

  const { content } = body;

  try {
    const [todoItemId] = await knex(db.TODO_ITEM_TABLE_NAME)
      .insert({
        content,
        completed: false,
        deleted: false,
        user_id: res.locals.userId,
      })
      .returning('id');

    const responseData = await knex(db.TODO_ITEM_TABLE_NAME).where({ id: todoItemId });
    if (responseData.length === 1) {
      return res.status(201).json(responseData[0]);
    }
    return res.status(500).json({ error: 'something weird happened with the API. contact james' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'something weird happened with the API. contact james' });
  }
});

module.exports = {
  router,
};
