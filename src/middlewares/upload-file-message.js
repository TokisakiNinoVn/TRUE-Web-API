// upload-file-message.js
const multer = require('multer');
const path = require('path');

// Thiết lập multer để upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/message/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).array('file');

module.exports = upload;
