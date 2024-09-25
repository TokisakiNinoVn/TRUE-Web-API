const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    messages: [{
        // sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
        sender: { type: String },
        type: {
            type: String,
            enum: ['text', 'image', 'video'],
        },
        content: {
            type: String,
            default: ""
        },
        // mediaFile:[{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],    // ObjectId map với collection File (ảnh/video) nếu có
        status: {
            type: String,
            enum: ['active', 'revoked'],
            default: 'active',
        },

        deleteBy: [{
            username: { type: String },
            updateAt: { type: Date, default: Date.now }
        }],
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

 
MessageSchema.plugin(mongoosePaginate);
const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
