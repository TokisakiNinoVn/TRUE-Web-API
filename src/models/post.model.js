const { types } = require('joi');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PostSchema = new mongoose.Schema(
{
    author: { type: String,  required: true },
    owner: { type: String, required: true},
    title: { type: String, required: true },
    description: { type: String, },
    address: { type: String, required: true },
    //Địa chỉ cụ thể
    realaddress: { type: String, },
    //Diện tích
    acreage: { type: Number, },
    typeroom: { type: Number, // 0 là trọ, 1 là Căn hộ,
        enum: [0, 1],
    },
    price: { type: Number, },
    active: {
        type: Number,
        enum: [0, 1],
        default: 1
    },
    file: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
    }],
    note: {
        type: String,
        default: ""
    }
}, { timestamps: true });

PostSchema.plugin(mongoosePaginate);
const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
