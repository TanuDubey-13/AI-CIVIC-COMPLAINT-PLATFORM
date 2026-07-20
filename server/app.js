const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI Civic Complaint Platform API is running' });
});

module.exports = app;
