const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.post('/auth', (req, res) => {
  // check for username in req
  // check db for username

  const token = 'asillytoken';
  res.header('set-cookie', `token=${token}`).json({ token });
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
