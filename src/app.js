const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const user = require('./user');
const auth = require('./auth');
const todoItem = require('./todo-item');

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(fileUpload());

// handle JSON syntax errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: 'body must be valid JSON' });
  }
  next();
});

app.get('/', (req, res) => {
  return res.redirect('https://docs.google.com/document/d/1F-d-O1TTI69Sm9lk-zD-xepbUl_AbpKnB2h4dAMaQo8');
});

app.use(user.router);
app.use(auth.router);
app.use(auth.gateMiddleware);
app.use(todoItem.router);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
