const express = require('express');
const router = express.Router();
const { fileController } = require('../../controllers/index');

router.post('/upload', fileController.uploadFile);

module.exports = router;