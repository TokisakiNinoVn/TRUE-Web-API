const express = require('express');
const router = express.Router();
const { conversationController } = require('../../controllers/index');

// Tạo cuộc hội thoại mới
router.post('/create', conversationController.createConversation);

// Lấy tin nhắn của một cuộc hội thoại (với id của cuộc hội thoại)
// router.get('/:id', conversationController.getMessages);
router.post('/:id', conversationController.getMessages);

// Xóa cuộc hội thoại cho một người dùng
router.delete('/:id', conversationController.deleteConversationForUser);

router.post('/search', conversationController.searchConversationByUsername);

router.post('/', conversationController.getConversationsForUserLogin);
module.exports = router;
