const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const IndividualSchema = new mongoose.Schema(
{
    fullname: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    avatar: {
        type: String,
        default: ""
    },
    gender: {
        type: Number,
    },
    birthday: {
        type: Date,
        default: mongoose.now
    },
    verification: {
        type: Boolean,
        default: false
    },
    note: {
        type: String,
        default: ""
    }
}, { timestamps: true });

IndividualSchema.plugin(mongoosePaginate);
const Individual = mongoose.model("Individual", IndividualSchema);
module.exports = Individual;
