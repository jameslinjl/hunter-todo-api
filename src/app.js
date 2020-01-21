const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const user = require('./user');

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

app.use(user.router);

app.post('/auth', (req, res) => {
  // check for username in req -> error if username not provided
  // check db for username -> error if username doesnt exist in db
  // generate token and return

  const token = 'asillytoken';
  res.header('set-cookie', `token=${token}`).json({ token });
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
