const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

const USER_TABLE_NAME = 'todo_user';
const TODO_ITEM_TABLE_NAME = 'todo_item';

const createTables = () => {
  knex.schema
    .createTable(USER_TABLE_NAME, (table) => {
      table.increments('id');
      table.string('username');
      table.string('profile_picture_url');
    })
    .createTable(TODO_ITEM_TABLE_NAME, (table) => {
      table.increments('id');
      table.text('content');
      table.boolean('completed');
      table.boolean('deleted');
      table.integer('user_id');
      table
        .foreign('user_id')
        .references('id')
        .inTable(USER_TABLE_NAME)
        .onDelete('cascade');
    })
    .then(() => {
      console.log(`success - created ${USER_TABLE_NAME} table`);
      console.log(`success - created ${TODO_ITEM_TABLE_NAME} table`);
    })
    .finally(() => {
      knex.destroy();
    });
};

const dropTables = () => {
  knex.schema
    .dropTableIfExists(TODO_ITEM_TABLE_NAME)
    .dropTableIfExists(USER_TABLE_NAME)
    .then(() => {
      console.log(`success - dropped ${TODO_ITEM_TABLE_NAME} table`);
      console.log(`success - dropped ${USER_TABLE_NAME} table`);
    })
    .finally(() => {
      knex.destroy();
    });
};

module.exports = {
  createTables,
  dropTables,
  USER_TABLE_NAME,
  TODO_ITEM_TABLE_NAME,
  knex,
};
