const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

const USER_TABLE_NAME = 'todo_user';

const createTables = () => {
  knex.schema
    .createTable(USER_TABLE_NAME, (table) => {
      table.increments('id');
      table.string('username');
    })
    .then(() => {
      console.log(`success - created ${USER_TABLE_NAME} table`);
    })
    .finally(() => {
      knex.destroy();
    });
};

const dropTables = () => {
  knex.schema
    .dropTableIfExists(USER_TABLE_NAME)
    .then(() => {
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
  knex,
};
