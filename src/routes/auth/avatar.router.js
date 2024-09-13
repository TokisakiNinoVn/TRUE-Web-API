const express = require('express');
const router = express.Router();
const { avatarController } = require('../../controllers/index');

router.post('/upload', avatarController.uploadAvatar);
router.get('/:id', avatarController.getAvatar);

module.exports = router;


module.exports = router;