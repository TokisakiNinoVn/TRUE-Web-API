const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Account, Role, Individual } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code.js');
const AppError = require('../../utils/app-error');
const { LoginSchema } = require('./auth.validation');

const createToken = async userInfo => {
    return jwt.sign({userInfo}, process.env.JWT_SECRET, {expiresIn: "24h"});
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        // 1) Validate user input
        const { error } = LoginSchema.validate({ username, password });
        if (error) {
            return next(new AppError(HTTP_STATUS.BAD_REQUEST, 'Bad Request', `Validation error: ${error.details.map(x => x.message).join(', ')}`));
        }

        // 2) Check if user exists
        const user = await Account.findOne({ username })
            .select('+password')
            .populate('role');

        if (!user) {
            return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'fail', 'Sai thông tin tên tài khoản hoặc mật khẩu! 🥲'));
        }

        // 3) Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'fail', 'Sai thông tin tên tài khoản hoặc mật khẩu! 🥲'));
        }

        const userLoginedData = {
            id: user.id,
            username,
            role: user.role.name,
        };
        
        // 4) Create token
        const token = await createToken(userLoginedData);

        user.password = undefined;

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            token,
            data: userLoginedData,
            message: "Đăng nhập thành công"
        });
    } catch (error) {
        next(error);
    }
};


exports.logout = async (req, res, next) => {
    const token  = req.headers["x-access-token"];
    return res.status(HTTP_STATUS.OK).json({
        status: 'success',
        token,
        message: 'Đăng xuất thành công.'
    })
};

exports.signup = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const userDB = await Account.findOne({ username }).select('+username');
        if (userDB) {
            return next(new AppError(HTTP_STATUS.BAD_REQUEST, 'fail', 'Tài khoản đã tồn tại. Hãy thử đăng ký tài khoản khác.'));
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const customerRole = await Role.findOne({ name: 'Customer' });
        if (!customerRole) {
            return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Role "Customer" not found.'));
        }
        const user = await Account.create({
            username,
            password: hashedPassword,
            role: customerRole._id,
            active: false
        });

        // Create token 
        const userData = {
            id: user._id,
            username: user.username
        };
        const token = await createToken(userData);
        user.password = undefined;
        res.status(201).json({
            status: 'success',
            token,
            data: user
        });
    } catch (err) {
        next(err);
    }
};
