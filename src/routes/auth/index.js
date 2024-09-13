const express = require('express');
var app = express();

// Import child routers
const accountRouter = require("./account.router");
const avatarRouter = require("./avatar.router");
const authRouter = require("./auth.router");


// Use child router
app.use("/account", accountRouter);
app.use("/avatar", avatarRouter);
app.use("/logout", authRouter);


module.exports = app;