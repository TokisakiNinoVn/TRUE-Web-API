const express = require('express');
var app = express();

// Import child routers
const authRouter = require('./auth.router');
// const dropdownRouter = require('./dropdown.router');

app.use('/auth', authRouter);
// app.use('/dropdowns', dropdownRouter);


module.exports = app;