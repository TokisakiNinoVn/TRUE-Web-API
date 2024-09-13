const express = require('express');
const router = express.Router();

// Import child routers
const authRouter = require('./auth.router');
const accountRouter = require('./account.router');


// Use child router
router.use('/auth', authRouter);
router.use('/user', accountRouter);

module.exports = router;

