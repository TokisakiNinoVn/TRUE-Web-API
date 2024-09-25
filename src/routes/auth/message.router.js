const express = require('express');
const router = express.Router();
const { messageController } = require('../../controllers/index');
const upload = require('../../middlewares/upload-file-message');

// Gửi tin nhắn mới
router.post('/', messageController.sendMessage);

// Thu hồi tin nhắn
router.put('/revoke', messageController.revokeMessage);

module.exports = router;
