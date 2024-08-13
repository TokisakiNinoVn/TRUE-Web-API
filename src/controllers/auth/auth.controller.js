const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Account } = require('../../models/index');
const { LoginSchema } = require('./auth.validation');
const { HTTP_STATUS } = require('../../constants/status-code.js');
const AppError = require('../../utils/app-error');

const createToken = async (userInfo) => {
    return jwt.sign({
        userInfo
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.login = async (req, res, next) => {
    try {
        // Validate login input
        const { username, password } = req.body;

        // Check if the user exists
        const user = await Account.findOne({ username }).select('+password');
        if (!user) {
            return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'fail', 'Invalid username or password'));
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'fail', 'Invalid username or password'));
        }

        // Create token
        const token = await createToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        // Remove password from output
        user.password = undefined;

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            token,
            data: user,
            message: "Đăng nhập thành công"
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    // Here you might want to invalidate the token or handle token blacklisting if needed
    res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Đăng xuất thành công.'
    });
};

exports.signup = async (req, res, next) => {
    try {
        // Validate user information
        const { username, password, role = 'mod', active = false } = req.body;

        // Check if the username already exists
        const userDB = await Account.findOne({ username }).select('+username');
        if (userDB) {
            return next(new AppError(HTTP_STATUS.BAD_REQUEST, 'fail', 'Tài khoản đã tồn tại. Hãy thử đăng ký tài khoản khác.'));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await Account.create({
            username,
            password: hashedPassword,
            role,
            active
        });

        // Create token
        const userData = {
            id: user._id,
            username: user.username,
            role: user.role
        };
        const token = await createToken(userData);

        // Remove password from output
        user.password = undefined;
        console.log("Tạo tài khoản:", user);
        res.status(201).json({
            status: 'success',
            token,
            data: user
        });
        
    } catch (err) {
        next(err);
    }
};
