const { Avatar } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code');
const AppError = require('../../utils/app-error');
const path = require('path');
const multer = require('multer');

// Cấu hình Multer để lưu trữ file avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ( 'public/uploads/images/avatars/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('avatar');

// Hàm upload avatar
exports.uploadAvatar = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error uploading file', error: err });
        }

        if (!req.file) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: 'No file uploaded' });
        }

        try {
            const fileName = req.file.filename;
            
            const newAvatar = new Avatar({
                name: fileName,
                imageUrl: `/uploads/images/avatars/${fileName}`
            });

            const docs = await newAvatar.save();
            return next(docs, req, res, next);
        } catch (error) {
            next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error saving avatar', []), req, res, next);
        }
    });
};


exports.getAvatar = async (req, res, next) => {
    try {
        const avatarId = req.params.id;
        const docs = await Avatar.findById(avatarId);

        if (!docs) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'Avatar not found', []), req, res, next);
        }

        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No document found', []), req, res, next);
    }
};
