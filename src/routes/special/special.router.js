const express = require('express');
const router = express.Router();
const {cache} = require('../../services/cache')


// GET /api/
router.get('/', cache, (req, res, next) => {
    res.status(200).json({
        msg: "Get special APIs"
    })
});

module.exports = router;