const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const AvatarSchema = new mongoose.Schema(
{
    name: {
        type: String
    },
    imageUrl: {
        type: String
    }
}, { timestamps: true });

AvatarSchema.plugin(mongoosePaginate);
const Avatar = mongoose.model("Avatar", AvatarSchema);
module.exports = Avatar;
