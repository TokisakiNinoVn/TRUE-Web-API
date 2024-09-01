const express = require('express');
var app = express();

// Import child routers
const accountRouter = require("./account.router");


// Use child router
app.use("/account", accountRouter);


module.exports = app;