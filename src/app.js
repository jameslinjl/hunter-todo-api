const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const user = require('./user');
const auth = require('./auth');

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
app.use(auth.router);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
