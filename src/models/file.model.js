const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    typefile: {
        type: String, // "Video" hoặc "Image" hoặc tương tự
        required: true
    }
}, { timestamps: true });

FileSchema.plugin(mongoosePaginate);
const File = mongoose.model("File", FileSchema);
module.exports = File;
