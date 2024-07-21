const express = require('express');
const app = express();
const SpecialRouter = require('./special.router');

app.use('/special', SpecialRouter);

module.exports = app;