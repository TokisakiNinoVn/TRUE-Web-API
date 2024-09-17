const express = require('express');
const router = express.Router();
const { fileController } = require('../../controllers/index');

router.get('/:id', fileController.getFile);

module.exports = router;