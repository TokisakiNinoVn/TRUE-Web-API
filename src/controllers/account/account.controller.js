const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Account, Individual } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code');
const AppError = require('../../utils/app-error');

/**
 * @desc    Update Account and Individual Information
 * @route   PUT /api/accounts/:id
 * @access  Private
 */
exports.updateAccount = async (req, res, next) => {
    try {
        const accountId = req.params.id;
        const {
            username,
            password,
            role,
            status,
            active,
            individualData
        } = req.body;

        // Find account by ID
        let account = await Account.findById(accountId);

        if (!account) {
            // return res.status(404).json({ message: 'Account not found' });
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'failed', 'Account not found', {}), req, res, next);
        }

        // Update account fields
        if (username) account.username = username;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            account.password = await bcrypt.hash(password, salt);
        }
        if (role) account.role = role;
        if (status !== undefined) account.status = status;
        if (active !== undefined) account.active = active;

        // Update or create Individual information
        if (account.userInfor) {
            // Update existing Individual
            await Individual.findByIdAndUpdate(account.userInfor, individualData, { new: true, runValidators: true });
        } else {
            // Create new Individual and associate with account
            const newIndividual = new Individual(individualData);
            await newIndividual.save();
            account.userInfor = newIndividual._id;
        }

        await account.save();

        // Populate the Individual data before sending response
        account = await Account.findById(accountId).populate('userInfor');

        return res.status(200).json({
            message: 'Account updated successfully',
            data: account
        });
    } catch (error) {
        // console.error(error);
        // res.status(500).json({ message: 'Server Error' });
        return next(error)
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
            populate: 'userInfor'
        };

        const accounts = await Account.paginate({}, options);

        return res.status(200).json({
            message: 'Accounts retrieved successfully',
            data: accounts
        });
    } catch (error) {
        // console.error(error);
        // res.status(500).json({ message: 'Server Error' });
        return next(error)

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
            // return res.status(404).json({ message: 'Account not found' });
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'failed', 'Account not found', {}), req, res, next);
        }

        // Delete associated Individual if exists
        if (account.userInfor) {
            await Individual.findByIdAndDelete(account.userInfor);
        }

        // Delete Account
        await Account.findByIdAndDelete(accountId);

        return res.status(200).json({ message: 'Account and associated Individual information deleted successfully' });
    } catch (error) {
        // console.error(error);
        // res.status(500).json({ message: 'Server Error' });
        return next(error)

    }
};

// Get account details including individual info
exports.getAccountDetails = async (req, res, next) => {
    try {
      const { accountId } = req.params;
  
      const account = await Account.findById(accountId).populate('userInfor');
  
      if (!account) {
        //   return res.status(404).json({ message: "Account not found" });
          return next(new AppError(HTTP_STATUS.NOT_FOUND, 'failed', 'Account not found', {}), req, res, next);
      }
  
      return res.status(200).json(account);
    } catch (error) {
        // return res.status(500).json({ message: "Server error", error });
        return  next(error)
        
    }
  };
  
// module.exports = {
//     updateAccount,
//     getAllAccounts,
//     deleteAccount
// };
