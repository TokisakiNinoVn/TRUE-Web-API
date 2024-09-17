const express = require('express');
const router = express.Router();
const { avatarController } = require('../../controllers/index');

router.post('/upload', avatarController.uploadAvatar);

module.exports = router;