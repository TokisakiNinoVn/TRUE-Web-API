const { Account, Individual } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code');
const AppError = require('../../utils/app-error');

/**
 * @desc    Update Account and Individual Information
 * @route   PUT /api/account/username
 * @access  Private
 */
exports.updateAccount = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { userInfor } = req.body;

        const account = await Account.findOne({ username });

        if (!account) {
            console.log('Account not found');
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'failed', 'Account not found', {}));
        }

        if (account.userInfor) {
            await Individual.findByIdAndUpdate(account.userInfor, userInfor, { new: true, runValidators: true });
        } else {
            const newIndividual = new Individual(userInfor);
            await newIndividual.save();
            account.userInfor = newIndividual._id;
        }

        await account.save();

        const docs = await Account.findOne({ username }).populate('userInfor');
        return next(docs, req, res, next);
    } catch (error) {
        console.error('An error occurred:', error);
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'failed', 'An error occurred', {}));
    }
};

/**
 * @desc    Delete Account and Associated Individual Information
 * @route   DELETE /api/accounts/:id
 * @access  Private
 */
exports.deleteAccount = async (req, res, next) => {
    try {
        const accountId = req.params.id;

        const account = await Account.findById(accountId);

        if (!account) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No document found', []), req, res, next);
        }
        if (account.userInfor) {
            await Individual.findByIdAndDelete(account.userInfor);
        }

        const docs = await Account.findByIdAndDelete(accountId);

        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No document found', []), req, res, next);
    }
};

/**
 * @desc    Get account details including individual info
 * @route   GET /api/accounts/:id
 * @access  Private
 */
exports.getAccountDetails = async (req, res, next) => {
    try {
        const accountId = req.params.id;
        const docs = await Account.findById(accountId).populate('userInfor');
        docs.role = undefined;
        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No document found', []), req, res, next);
    }
};

exports.getInforByUsername = async (req, res, next) => {
    try {
        const username = req.params.username;

        // Tìm kiếm tài khoản và populate thông tin cá nhân
        const account = await Account.findOne({ username })
            .populate({
                path: 'userInfor',
                populate: {
                    path: 'avatar',
                    model: 'Avatar'
                }
            })
            .lean()
            .select('username status active userInfor');

        if (!account) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'failed', 'Account not found', {}));
        }

        // Lọc các thuộc tính không cần thiết từ Account
        const { updatedAt, createdAt, __v, _id, note, ...filteredAccount } = account;

        // Kiểm tra nếu userInfor tồn tại
        let filteredUserInfor = null;
        if (account.userInfor) {
            const { updatedAt: userUpdatedAt, createdAt: userCreatedAt, __v: userV, _id: userId, note: userNote, avatar, ...userInforFiltered } = account.userInfor;

            // Kiểm tra nếu avatar không tồn tại hoặc là chuỗi rỗng
            let userAvatar = null;
            if (avatar) {
                userAvatar = avatar;
            } else {
                userAvatar = {
                    _id: "66e402cf7bd14f41798aebc0",
                    name: "avatardefault.jpg",
                    imageUrl: "/uploads/images/avatars/avatardefault.jpg",
                };
            }

            filteredUserInfor = {
                ...userInforFiltered,
                avatar: userAvatar
            };
        } else {
            // Nếu không có userInfor, thêm thông tin userInfor với avatar mặc định
            filteredUserInfor = {
                fullname: "",
                email: "",
                phone: "",
                address: "",
                avatar: {
                    _id: "66e402cf7bd14f41798aebc0",
                    name: "avatardefault.jpg",
                    imageUrl: "/uploads/images/avatars/avatardefault.jpg",
                },
                gender: null,
                birthday: null,
                verification: false,
                bio: "",
                note: ""
            };
        }

        res.json({
            ...filteredAccount,
            userInfor: filteredUserInfor
        });
    } catch (error) {
        return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Error fetching account information', []));
    }
};


/**
 * @desc    Get All Accounts with Individual Information
 * @route   GET /api/accounts
 * @access  Private
 */
exports.getAllAccounts = async (req, res, next) => {
    try {
        const { page, limit } = req.query;

        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        };

        const docs = await Account.paginate({}, options);

        return next(docs, req, res, next);
    } catch (error) {
        return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'No document found', []), req, res, next);
    }
};
