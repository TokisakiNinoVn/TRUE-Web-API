const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const RoleSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: [true, "Please fill your user name"],
        unique: true
    }
}, { timestamps: true });

RoleSchema.plugin(mongoosePaginate);
const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
