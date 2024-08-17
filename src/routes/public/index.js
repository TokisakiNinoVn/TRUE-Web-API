const express = require('express');
const router = express.Router();

// Import child routers
const authRouter = require('./auth.router');


// Use child router
router.use('/auth', authRouter);

module.exports = router;

