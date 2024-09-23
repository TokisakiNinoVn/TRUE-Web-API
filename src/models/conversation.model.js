const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ConversationSchema = new mongoose.Schema({
    account1: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
            username: { type: String }
        }
    ],
    account2: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
            username: { type: String }
        }
    ],
    isDeletedByUser1: {
        type: Boolean, 
        default: false
    },
    isDeletedByUser2: {
        type: Boolean,
        default: false
    },
    deletedAtByUser1: {
        type: Date,
        default: null
    },
    deletedAtByUser2: {
        type: Date,
        default: null
    }
}, { timestamps: true });

ConversationSchema.plugin(mongoosePaginate);
const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;


// const mongoose = require('mongoose');
// const mongoosePaginate = require('mongoose-paginate-v2');

// const ConversationSchema = new mongoose.Schema({
//     account1: [
//         {
//             id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
//             username: { type: String },
//         }
//     ],
//     account2: [
//         {
//             id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
//             username: { type: String },
//         }
//     ],
//     isDeletedByUser1: {
//         type: Boolean,
//         default: false
//     },
//     isDeletedByUser2: {
//         type: Boolean,
//         default: false
//     },
//     deletedAtByUser1: {
//         type: Date,
//         default: null
//     },
//     deletedAtByUser2: {
//         type: Date,
//         default: null
//     },
//     // Lưu các số trong _id của bản ghi
//     idNumber: {
//         type: String, // Giữ dạng chuỗi số
//     }
// }, { timestamps: true });

// ConversationSchema.plugin(mongoosePaginate);

// // Hàm loại bỏ các chữ cái trong _id và chỉ giữ lại số
// function extractNumbersFromId(id) {
//     return id.toString().replace(/\D/g, ''); // Loại bỏ mọi ký tự không phải số
// }

// // Tạo idNumber trước khi lưu bản ghi
// ConversationSchema.pre('save', function (next) {
//     if (!this.idNumber) {
//         this.idNumber = extractNumbersFromId(this._id);
//     }
//     next();
// });

// const Conversation = mongoose.model("Conversation", ConversationSchema);
// module.exports = Conversation;
