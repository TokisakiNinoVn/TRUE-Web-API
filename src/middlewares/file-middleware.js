const path = require("path");
const multer = require("multer");
const fs = require("fs");
const config = require("@app/configs/mine-type.config");
const moment = require('moment');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const today = moment();
    const uploadDirectory = `public/uploads/${today.year()}/${today.month() + 1}/${today.date()}`;
    fs.mkdirSync(uploadDirectory, { recursive: true });
    return cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, moment() + ext);
  },
});

exports.upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
      if (config.allowMineType.includes(file.mimetype)    ) {
        callback(null, true);
      } else {   
        callback(null, false);
      }
    },
    limits: {
      fileSize: 1024 * 1024 * 50,
    },
  });
