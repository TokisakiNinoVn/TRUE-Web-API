const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Account, Role, Individual } = require('../../models/index');
const { HTTP_STATUS } = require('../../constants/status-code.js');
const AppError = require('../../utils/app-error');
const { LoginSchema } = require('./auth.validation');

const createToken = async userInfo => {
    return jwt.sign({
        userInfo
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
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
            return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'fail', 'Invalid username or password'));
        }

        // 3) Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'fail', 'Invalid username or password'));
        }

        const individualInfo = await Individual.findById(user.userInfor);

        if (!individualInfo) {
            return next(new AppError(HTTP_STATUS.NOT_FOUND, 'fail', 'User information not found'));
        }

        const userLoginedData = {
            id: user.id,
            username,
            role: user.role.name,
            userInfor: individualInfo
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
    // res.status(HTTP_STATUS.OK).json({
    //     status: 'success',
    //     message: 'Đăng xuất thành công.'
    // });
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

        // Check if the user already exists
        const userDB = await Account.findOne({ username }).select('+username');
        if (userDB) {
            return next(new AppError(HTTP_STATUS.BAD_REQUEST, 'fail', 'Tài khoản đã tồn tại. Hãy thử đăng ký tài khoản khác.'));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Get role ID for 'Customer'
        const customerRole = await Role.findOne({ name: 'Customer' });
        if (!customerRole) {
            return next(new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'fail', 'Role "Customer" not found.'));
        }

        // Create the user
        const user = await Account.create({
            username,
            password: hashedPassword,
            role: customerRole._id,
            active: false
        });

        // Create token
        const userData = {
            id: user._id,
            username: user.username,
            role: user.role
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
