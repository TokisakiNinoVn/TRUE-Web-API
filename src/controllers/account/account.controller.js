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

        const account = await Account.findOne({ username })
            .populate('userInfor')
            .lean()
            .select('username status active userInfor');

        if (!account) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'failed', 'Account not found', {}));
        }

        // Loại bỏ các trường không cần thiết
        const { updatedAt, createdAt, __v, _id, note, ...filteredAccount } = account;
        const { updatedAt: userUpdatedAt, createdAt: userCreatedAt, __v: userV, _id: userId, note: userNote,...filteredUserInfor } = account.userInfor;

        // Tạo phản hồi với dữ liệu đã được lọc
        res.json({
            ...filteredAccount,
            userInfor: filteredUserInfor
        });
    } catch (error) {
        return next(new AppError(HTTP_STATUS.SERVER_ERROR, 'failed', 'Something went wrong', {}));
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
