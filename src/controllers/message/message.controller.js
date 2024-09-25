const { Message, Conversation } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code');
const AppError = require('../../utils/app-error');
const { createConversation } = require('../conversation/conversation.controller');

exports.sendMessage = async (req, res, next) => {
    const { senderUsername, recipientUsername, type, content } = req.body;

    try {
        // Tìm kiếm cuộc hội thoại giữa sender và recipient dựa trên username
        let conversation = await Conversation.findOne({
            $or: [
                { 'account1.username': senderUsername, 'account2.username': recipientUsername },
                { 'account1.username': recipientUsername, 'account2.username': senderUsername }
            ]
        });

        // Nếu không tìm thấy cuộc hội thoại, tạo cuộc hội thoại mới
        if (!conversation) {
            const createConvReq = { body: { username1: senderUsername, username2: recipientUsername } };
            await createConversation(createConvReq, res, next);
            
            // Tìm kiếm lại cuộc hội thoại sau khi tạo
            conversation = await Conversation.findOne({
                $or: [
                    { 'account1.username': senderUsername, 'account2.username': recipientUsername },
                    { 'account1.username': recipientUsername, 'account2.username': senderUsername }
                ]
            });
        }

        const newMessageContent = {
            sender: senderUsername,
            type: type || 'text', 
            content: content,
            deleteBy: [],
            createdAt: new Date(),
        };

        // Kiểm tra nếu đã có tin nhắn trong cuộc hội thoại này
        let existingMessage = await Message.findOne({ conversation: conversation._id });
        
        if (existingMessage) {
            // Nếu đã có tin nhắn, thêm tin nhắn mới vào danh sách
            existingMessage.messages.push(newMessageContent);
            await existingMessage.save();
            // return res.status(200).json({ message: "Tin nhắn đã được gửi thành công.", existingMessage });
        } else {
            // Nếu chưa có tin nhắn, tạo bản ghi tin nhắn mới
            const newMessage = new Message({
                conversation: conversation._id,
                messages: [newMessageContent],
            });
            await newMessage.save();
            return res.status(200).json({ message: "Tin nhắn đã được gửi thành công.", newMessage });
        }

        // Cập nhật trạng thái cuộc hội thoại nếu trước đó bị đánh dấu xóa
        if (conversation.isDeletedByUser1 && conversation.account1[0].username === senderUsername) {
            conversation.isDeletedByUser1 = false;
        } else if (conversation.isDeletedByUser2 && conversation.account2[0].username === senderUsername) {
            conversation.isDeletedByUser2 = false;
        }

        await conversation.save();

        // Gửi phản hồi chỉ một lần
        return res.status(200).json({ message: "Tin nhắn đã được gửi thành công.", conversation }); 
    } catch (error) {
        console.error("Error:", error);
        // Đảm bảo không gửi phản hồi nếu đã gửi trước đó
        if (!res.headersSent) {
            return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error sending message', []), req, res, next);
        }
    }
};

// Thu hồi tin nhắn
exports.revokeMessage = async (req, res, next) => {
    const { conversationId, messageId, senderUsername } = req.body;

    try {
        // Tìm cuộc hội thoại
        const conversationDoc = await Conversation.findById(conversationId);
        if (!conversationDoc) {
            return res.status(404).json({ message: "Cuộc hội thoại không tồn tại." });
        }

        // Tìm tin nhắn trong collection Message
        const messageDoc = await Message.findOne({ conversation: conversationId });
        if (!messageDoc) {
            return res.status(404).json({ message: "Không tìm thấy tin nhắn cho cuộc hội thoại này." });
        }

        // Tìm tin nhắn cụ thể trong mảng messages
        const message = messageDoc.messages.id(messageId);
        if (!message) {
            return res.status(404).json({ message: "Tin nhắn không tồn tại." });
        }

        // Kiểm tra xem người thu hồi có phải là người gửi không
        if (message.sender !== senderUsername) {
            return res.status(403).json({ message: "Bạn không thể thu hồi tin nhắn này." });
        }

        // Thu hồi tin nhắn (cập nhật trạng thái và nội dung)
        message.type = 'text';
        message.content = 'Tin nhắn này đã được thu hồi.';
        message.status = 'revoked'; // Cập nhật trạng thái

        // Cập nhật thời gian sửa đổi
        message.updatedAt = new Date();

        // Lưu thay đổi trong collection Message
        await messageDoc.save();

        res.status(200).json({ message: "Tin nhắn đã được thu hồi thành công." });
    } catch (error) {
        // Xử lý lỗi
        console.error("Error details:", error); 
        next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error revoking message', []), req, res, next);
    }
};
