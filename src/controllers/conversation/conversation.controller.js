const { Conversation, Account, Message, Individual, Avatar } = require('../../models/index');
const AppError = require('../../utils/app-error');
const { HTTP_STATUS } = require('../../constants/status-code');

exports.getConversationsForUserLogin = async (req, res, next) => {
    const { userLogin } = req.body;

    try {
        const conversations = await Conversation.find({
            $or: [
                { 'account1.username': userLogin },
                { 'account2.username': userLogin }
            ],
            isDeletedByUser1: false,
            isDeletedByUser2: false 
        });

        if (conversations.length === 0) {
            return res.status(200).json({ message: "Không tìm thấy cuộc hội thoại nào cho người dùng này." });
        }

        const docs = await Promise.all(conversations.map(async (conversation) => {
            let account2Username = null;

            if (conversation.account1.length > 0 && conversation.account1[0].username === userLogin) {
                account2Username = conversation.account2.length > 0 ? conversation.account2[0].username : null;
            } else if (conversation.account2.length > 0 && conversation.account2[0].username === userLogin) {
                account2Username = conversation.account1.length > 0 ? conversation.account1[0].username : null;
            }

            const account2 = await Account.findOne({ username: account2Username }).select('userInfor');
            // console.log("account2:", account2);
            if (!account2) {
                // console.log("Không tìm thấy tài khoản cho username:", account2Username);
                return null;
            }

            // Thiết lập avatar mặc định
            let imageUrl = "/uploads/images/avatars/avatardefault.jpg"; 

            // Kiểm tra userInfor
            if (account2.userInfor && account2.userInfor._id) {
                const individual = await Individual.findById(account2.userInfor).select('avatar');
                if (individual) {
                    const avatar = await Avatar.findById(individual.avatar).select('imageUrl');
                    if (avatar) {
                        imageUrl = avatar.imageUrl;
                    }
                }
            } else {
                // console.log("userInfor không hợp lệ:", account2.userInfor);
            }

            const messageDoc = await Message.findOne({ conversation: conversation._id }).sort({ createdAt: -1 });
            const lastMessage = messageDoc && messageDoc.messages.length > 0 ? messageDoc.messages[messageDoc.messages.length - 1] : null;

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

        // res.status(200).json({ conversations: docs });
        return next(docs, req, res, next);
    } catch (error) {
        next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', error.message, []), req, res, next);
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

        const docs = await Message.findOne({ conversation: conversationId });
        if (docs) {
            docs.messages = docs.messages.map(message => {
                // Kiểm tra nếu `username` đã có trong `deleteBy`
                const existingEntry = message.deleteBy.find(entry => entry.username === username);
                if (existingEntry) {
                    // Nếu đã có, cập nhật `updateAt`
                    existingEntry.updateAt = new Date();
                } else {
                    // Nếu chưa có, thêm vào
                    message.deleteBy.push({ username, updateAt: new Date() });
                }
                return message; // Trả về tin nhắn đã cập nhật
            });
            await docs.save();
        }

        // Lưu thay đổi cuộc hội thoại
        await conversation.save();
        return next(docs, req, res, next);
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
            // return res.status(200).json({ message: "Cuộc hội thoại đã tồn tại.", conversation: existingConversation });
        }

        const docs = await Conversation.create({
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

        return next(docs, req, res, next);
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

        // Loại bỏ các tin nhắn mà người dùng đã đánh dấu xóa
        const docs = messages.map(messageObj => {
            messageObj.messages = messageObj.messages.filter(message => {
                // Kiểm tra nếu `username` không có trong `deleteBy`
                return !message.deleteBy.some(entry => entry.username === username);
            });
            return messageObj;
        });

        // Nếu không có tin nhắn nào sau khi lọc, gửi thông điệp khuyến khích
        if (docs.length === 0 || docs.every(msgObj => msgObj.messages.length === 0)) {
            return res.status(200).json({ message: "Hãy bắt đầu với tin nhắn đầu tiên của bạn!" });
        }
        // return next(docs, req, res, next);
        return res.status(200).json({ message: "Lấy dữ liệu tin nhắn thành công!" });
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
            return res.status(200).json({ message: "Hãy bắt đầu với tin nhắn đầu tiên của bạn." });
        }

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
                    createdAt: message.createdAt,
                    _id: message._id
                }));
                return acc.concat(filteredMessages);
            }
            return acc;
        }, []);

        // Phản hồi với danh sách tin nhắn
        const response = {
            _id: conversations[0]._id, 
            conversation: conversations[0]._id, 
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


