const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const AccountSchema = new mongoose.Schema(
{
    username: {
        type: String,
        required: [true, "Please fill your user name"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please fill your password"],
        unique: true,
        minLength: 8,
        select: false,
    },
    role: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
        }
    ],
    status: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: false
    },
    userInfor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Individual'
    }
}, { timestamps: true });

AccountSchema.plugin(mongoosePaginate);
const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
