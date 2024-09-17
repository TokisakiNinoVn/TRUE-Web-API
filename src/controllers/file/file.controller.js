const { File } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code');
const AppError = require('../../utils/app-error');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, 'public/uploads/images/posts/');
        } else if (file.mimetype.startsWith('video')) {
            cb(null, 'public/uploads/videos/posts/');
        } else {
            cb(new Error('Invalid file type'), null);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage }).array('file');

// Hàm upload file
exports.uploadFile = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error uploading files', error: err });
        }

        if (!req.files || req.files.length === 0) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: 'No files uploaded' });
        }

        try {
            // Lưu các file vào cơ sở dữ liệu
            const filesData = req.files.map(file => {
                const typefile = file.mimetype.startsWith('image') ? 'Images' : 'Videos';
                return {
                    name: file.filename,
                    fileUrl: `/uploads/${typefile.toLowerCase()}/posts/${file.filename}`,
                    typefile: typefile
                };
            });

            const result = await File.insertMany(filesData);
            const ids = result.map(file => ({ "$oid": file._id.toString() }));

            return res.status(HTTP_STATUS.OK).json(ids);
        } catch (error) {
            next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error saving files', []), req, res, next);
        }
    });
};



exports.getFile = async (req, res, next) => {
    try {
        const fileId = req.params.id;
        const docs = await File.findById(fileId);

        if (!docs) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'File not found', []), req, res, next);
        }

        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No document found', []), req, res, next);
    }
};
