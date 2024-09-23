const express = require('express');
var app = express();

// Import child routers
const accountRouter = require("./account.router");
const avatarRouter = require("./avatar.router");
const fileRouter = require("./file.router");
const authRouter = require("./auth.router");
const postRouter = require("./post.router");
const conversationRouter = require("./conversation.router");
const messageRouter = require("./message.router");


// Use child router
app.use("/account", accountRouter);
app.use("/avatar", avatarRouter);
app.use("/logout", authRouter);
app.use("/post", postRouter);
app.use("/file", fileRouter);
app.use("/messages", conversationRouter);
app.use("/message", messageRouter);


module.exports = app;