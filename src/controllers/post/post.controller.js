const { Post, Account } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code');
const AppError = require('../../utils/app-error');

// Thêm bài đăng mới
exports.add = async (req, res, next) => {
    try {
        const docs = await Post.create(req.body);
        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Failed to create post', error));
    }
};

// Chỉnh sửa bài đăng
exports.edit = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const docs = await Post.findByIdAndUpdate(postId, req.body, { new: true, runValidators: true });

        if (!docs) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No post found with that ID', {}));
        }

        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Failed to update post', error));
    }
};

// Lấy thông tin chi tiết bài đăng theo ID
exports.getDetailsById = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const docs = await Post.findById(postId).populate('file').populate('author');

        if (!docs) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No post found with that ID', {}));
        }

        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Failed to retrieve post details', error));
    }
};



// Lấy thông tin bài đăng theo tên tài khoản
exports.getInforByUsername = async (req, res, next) => {
    try {
        const username = req.params.username;

        // Find posts by author username
        const posts = await Post.find({ author: username }).populate('file');

        if (!posts || posts.length === 0) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'Người dùng này chưa có bài viết nào', {}));
        }

        return res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: posts
        });
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Failed to retrieve posts', error));
    }
};


// Lấy tất cả bài đăng
exports.getAll = async (req, res, next) => {
    try {
        const posts = await Post.paginate({}, { page: req.query.page || 1, limit: req.query.limit || 10 });

        if (!posts || posts.docs.length === 0) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No posts found', {}));
        }

        return res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: posts.docs,
            totalPages: posts.totalPages,
            currentPage: posts.page
        });
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Failed to retrieve posts', error));
    }
};

// Tìm kiếm bài đăng
exports.search = async (req, res, next) => {
    try {
        const query = req.query;
        const searchCriteria = {};

        if (query.tittle) {
            searchCriteria.tittle = { $regex: query.tittle, $options: 'i' };
        }
        if (query.description) {
            searchCriteria.description = { $regex: query.description, $options: 'i' };
        }
        if (query.typeroom) {
            searchCriteria.typeroom = query.typeroom;
        }
        if (query.address || query.realaddress) {
            searchCriteria.address = { $regex: query.address, $options: 'i' };
        }
        if (query.acreage) {
            searchCriteria.acreage = { $regex: query.acreage, $options: 'i' };
        }

        // Sử dụng mongoose để tìm kiếm
        const posts = await Post.find(searchCriteria).populate('author').exec();

        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        next(error);
    }
};

// Lấy 10 bài đăng mới nhất
exports.getLatestPosts = async (req, res, next) => {
    try {
        const docs = await Post.find({})
            .sort({ createdAt: -1 })  // Sort by creation date, descending order
            .limit(10)                // Limit the result to 10 posts
            .populate('file')
            .populate('author');

        if (!docs || docs.length === 0) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No posts found', {}));
        }

        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Failed to retrieve latest posts', error));
    }
};


// Lấy 10 bài đăng có giá thấp nhất
exports.getLowestPricedPosts = async (req, res, next) => {
    try {
        const lowestPricedPosts = await Post.find({})
            .sort({ price: 1 })
            .limit(10)
            .populate('file')
            .populate('author');

        if (!lowestPricedPosts || lowestPricedPosts.length === 0) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No posts found', {}));
        }

        return res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: lowestPricedPosts
        });
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Failed to retrieve posts by price', error));
    }
};
