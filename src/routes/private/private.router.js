const express = require('express');
const { authMiddleware } = require('../../middlewares/auth-middleware');
const router = express.Router();

router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({ msg: "Welcome to the private dashboard!" });
});

module.exports = router;
