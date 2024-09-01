const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const logsSchema = new mongoose.Schema({
  command: String,
  action: String,
  account: String,
  content: String,
  result: String
}, { timestamps: true })

// Tự động xóa các document nào được tạo từ 30 ngày trước.
logsSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 } )

logsSchema.plugin(mongoosePaginate);

const Logs = mongoose.model("Logs", logsSchema);
module.exports = Logs;