const express = require('express');
const router = express.Router();
const { avatarController } = require('../../controllers/index');

router.get('/:id', avatarController.getAvatar);

module.exports = router;