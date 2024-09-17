const express = require('express');
const router = express.Router();

// Import child routers
const authRouter = require('./auth.router');
const accountRouter = require('./account.router');
const postRouter = require("./post.router");
const avatarRouter = require("./avatar.router");
const fileRouter = require("./file.router");

// Use child router
router.use('/auth', authRouter);
router.use('/user', accountRouter);
router.use("/post", postRouter);
router.use("/avatar", avatarRouter);
router.use("/file", fileRouter);

module.exports = router;

