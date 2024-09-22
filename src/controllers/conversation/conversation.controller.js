const { Conversation, Account, Message, Individual, Avatar } = require('../../models/index');
const AppError = require('../../utils/app-error');
const { HTTP_STATUS } = require('../../constants/status-code');

exports.getConversationsForUserLogin = async (req, res, next) => {
    const { userLogin } = req.body;

    try {
        if (!userLogin) {
            return res.status(400).json({ message: 'Username is required.' });
        }

        // Tìm tất cả các cuộc hội thoại với account1.username trùng với userLogin
        const conversations = await Conversation.find({
            'account1.username': userLogin
        });

        // Nếu không tìm thấy cuộc hội thoại nào
        if (conversations.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy cuộc hội thoại nào cho người dùng này." });
        }

        // Lấy thông tin của account2 và avatar cho mỗi cuộc hội thoại
        const conversationDetails = await Promise.all(conversations.map(async (conversation) => {
            const account2Username = conversation.account2[0].username;

            // Lấy thông tin tài khoản từ collection Account
            const account2 = await Account.findOne({ username: account2Username });
            if (!account2) return null;

            // Lấy thông tin từ collection Individual
            const individual = await Individual.findById(account2.userInfor);
            if (!individual) return null;

            // Lấy avatar từ collection Avatars
            const avatar = await Avatar.findById(individual.avatar);
            const imageUrl = avatar ? avatar.imageUrl : "";

            // Lấy tin nhắn cuối cùng
            const messageDoc = await Message.findOne({ conversation: conversation._id }).sort({ createdAt: -1 });
            const lastMessage = messageDoc ? messageDoc.messages[messageDoc.messages.length - 1] : null;

            return {
                conversationId: conversation._id,
                account2Username,
                lastMessage: lastMessage ? {
                    sender: lastMessage.sender,
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt
                } : null,
                avatar: imageUrl
            };
        }));

        // Lọc ra các cuộc hội thoại hợp lệ
        const validConversations = conversationDetails.filter(detail => detail !== null);

        res.status(200).json({ conversations: validConversations });
    } catch (error) {
        next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error retrieving conversations', []), req, res, next);
    }
};



exports.deleteConversationForUser = async (req, res, next) => {
    const { conversationId, username } = req.body;
    try {
        // Tìm cuộc hội thoại
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Cuộc hội thoại không tồn tại." });
        }

        // Đánh dấu cuộc hội thoại đã bị xóa bởi người dùng tương ứng
        const username1 = conversation.account1[0].username.toString();
        const username2 = conversation.account2[0].username.toString();

        if (username1 === username) {
            conversation.isDeletedByUser1 = true;
            conversation.deletedAtByUser1 = new Date();
        } else if (username2 === username) { 
            conversation.isDeletedByUser2 = true;
            conversation.deletedAtByUser2 = new Date();
        } else {
            return res.status(403).json({ message: "Người dùng không có quyền xóa cuộc hội thoại này." });
        }

        // Cập nhật trường deleteBy trong collection Message
        const messageDoc = await Message.findOne({ conversation: conversationId });
        if (messageDoc) {
            messageDoc.messages = messageDoc.messages.map(message => {
                message.deleteBy.push({ username });
                return message; // Trả về tin nhắn đã cập nhật
            });
            await messageDoc.save();
        }

        // Lưu thay đổi cuộc hội thoại
        await conversation.save();
        res.status(200).json({ message: "Cuộc hội thoại đã được xóa thành công cho người dùng." });
    } catch (error) {
        next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error deleting conversation', []), req, res, next);
    }
};


exports.createConversation = async (req, res, next) => {
    const { username1, username2 } = req.body;

    try {
        // Kiểm tra nếu username có giá trị
        if (!username1 || !username2) {
            return res.status(400).json({ message: 'Both usernames are required.' });
        }

        // Lấy thông tin tài khoản của user1 và user2 từ cơ sở dữ liệu dựa trên username
        const user1 = await Account.findOne({ username: username1 });
        const user2 = await Account.findOne({ username: username2 });

        // Kiểm tra nếu không tìm thấy tài khoản
        if (!user1 || !user2) {
            return res.status(404).json({ message: 'One or both users not found.' });
        }

        // Kiểm tra nếu đã có cuộc hội thoại giữa hai người dùng này dựa trên username
        const existingConversation = await Conversation.findOne({
            $or: [
                { 'account1.username': username1, 'account2.username': username2 },
                { 'account1.username': username2, 'account2.username': username1 }
            ]
        });

        if (existingConversation) {
            console.log("Cuộc hội thoại đã tồn tại.");
            return res.status(200).json({ message: "Cuộc hội thoại đã tồn tại.", conversation: existingConversation });
        }

        // Tạo cuộc hội thoại mới dựa trên username
        const newConversation = await Conversation.create({
            account1: [
                {
                    id: user1._id,
                    username: user1.username
                }
            ],
            account2: [
                {
                    id: user2._id,
                    username: user2.username
                }
            ]
        });

        // res.status(201).json({ message: "Cuộc hội thoại đã được tạo thành công.", newConversation });
    } catch (error) {
        console.error("Error:", error);
        next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error creating conversation', []), req, res, next);
    }
};

exports.getMessages = async (req, res, next) => {
    const { conversationId, username } = req.body;
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Cuộc hội thoại không tồn tại." });
        }

        // Xác định người dùng nào đang yêu cầu và thời điểm deletedAt
        let deletedAt;
        const username1 = conversation.account1[0].username.toString();
        const username2 = conversation.account2[0].username.toString();

        if (username1 === username) {
            deletedAt = conversation.deletedAtByUser1;
        } else if (username2 === username) {
            deletedAt = conversation.deletedAtByUser2;
        } else {
            return res.status(403).json({ message: "Người dùng không có quyền xem cuộc hội thoại này." });
        }

        // Truy vấn tin nhắn được gửi sau thời điểm deletedAt
        const messages = await Message.find({
            conversation: conversationId,
            createdAt: { $gte: deletedAt || conversation.createdAt }
        });

        // Nếu không có tin nhắn nào, gửi thông điệp khuyến khích
        if (messages.length === 0) {
            return res.status(200).json({ message: "Hãy bắt đầu với tin nhắn đầu tiên của bạn!" });
        }

        // Phản hồi với tin nhắn
        res.status(200).json({ messages });
    } catch (error) {
        next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error retrieving messages', []), req, res, next);
    }
};

exports.searchConversationByUsername = async (req, res, next) => {
    const { usernameLogin, username } = req.body;

    try {
        if (!username) {
            return res.status(400).json({ message: 'Username is required.' });
        }

        // Tìm kiếm cuộc hội thoại với người dùng khác
        const conversations = await Conversation.find({
            'account2.username': username
        });

        // Nếu không tìm thấy cuộc hội thoại nào
        if (conversations.length === 0 || conversations.some(convo => convo.isDeletedByUser1)) {
            return res.status(404).json({ message: "Hãy bắt đầu với tin nhắn đầu tiên của bạn." });
        }

        // Lấy tin nhắn cho tất cả các cuộc hội thoại tìm thấy
        const messageDocs = await Promise.all(
            conversations.map(conversation => Message.findOne({ conversation: conversation._id }))
        );

        // Lọc và kết hợp tất cả các tin nhắn
        const messages = messageDocs.reduce((acc, messageDoc) => {
            if (messageDoc && messageDoc.messages.length > 0) {
                const filteredMessages = messageDoc.messages.map(message => ({
                    sender: message.sender,
                    type: message.type,
                    content: message.content,
                    status: message.status,
                    // deleteBy: message.deleteBy.map(deleted => ({
                    //     username: deleted.username,
                    //     // _id: deleted._id // Giữ lại cả trường _id nếu cần
                    // })),
                    createdAt: message.createdAt,
                    _id: message._id
                }));
                return acc.concat(filteredMessages);
            }
            return acc;
        }, []);

        // Phản hồi với danh sách tin nhắn
        const response = {
            _id: conversations[0]._id, // Hoặc bạn có thể lấy _id từ cuộc hội thoại phù hợp
            conversation: conversations[0]._id, // Giả sử chỉ lấy cuộc hội thoại đầu tiên
            messages,
            createdAt: conversations[0].createdAt,
            updatedAt: conversations[0].updatedAt,
            __v: conversations[0].__v // Nếu cần
        };

        res.status(200).json({ usernameLogin, ...response });

    } catch (error) {
        next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error searching conversations', []), req, res, next);
    }
};


