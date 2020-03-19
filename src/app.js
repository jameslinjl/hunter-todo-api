const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const user = require('./user');
const auth = require('./auth');
const todoItem = require('./todo-item');

// TESTING
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'us-cdbr-iron-east-04.cleardb.net',
  user: 'b6034fb423fe74',
  password: 'c30bf13a',
  database: 'heroku_71ba344448d1b12',
});

connection.connect();
// TESTING

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.json());

// handle JSON syntax errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: 'body must be valid JSON' });
  }
  next();
});

app.get('/user-test', (req, res) => {
  connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw err;

    console.log('The solution is: ', rows[0].solution);
    res.send('ok!');
  });
});

app.get('/', (req, res) => {
  return res.redirect('https://docs.google.com/document/d/1F-d-O1TTI69Sm9lk-zD-xepbUl_AbpKnB2h4dAMaQo8');
});

app.use(user.router);
app.use(auth.router);
app.use(auth.gateMiddleware);
app.use(todoItem.router);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
