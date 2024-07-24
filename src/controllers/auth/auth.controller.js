const jwt = require('jsonwebtoken');
const { Account } = require('@app/models');
const AppError = require('@app/utils/app-error');
const { HTTP_STATUS } = require('@app/constants/status-code');
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

    // Bước 1: validate dữ liệu đăng nhập
    const { error } = LoginSchema.validate({ username, password });
    if (error) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, 'Bad Request', `Validation error: ${error.details.map(x => x.message).join(', ')}`), req, res, next);
    }
    
    // Bước 2: Kiểm tra thông tin username và password trong DB
    const userDB = await Account.findOne({ username }).select("+password").populate("role userInfor");
    if (!userDB) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Tài khoản không tồn tại!"), req, res, next);
    }

    // Bước 3: Kiểm tra xem mật khẩu có chính xác không?
    if (!(await userDB.correctPassword(password, userDB.password))) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Sai mật khẩu. Xin hãy kiểm tra lại."), req, res, next);
    }

    // Bước 4: Kiểm tra xem tài khoản còn đang được kích hoạt không?
    if (!userDB.active) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Tài khoản chưa được kích hoạt. Liên hệ với BQT để kích hoạt tài khoản"), req, res, next);
    }

    // Bước 5: Tất cả đều Ok thì cấp token và thông báo đăng nhập thành công.
    const userLoginedData = {
      id: userDB.id,
      username,
      fullname: userDB.userInfor?.fullname
    }
    const token = await createToken(userLoginedData);
    
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
  const token = req.headers["x-access-token"];
  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    token,
    message: 'Đăng xuất thành công.'
  });
}

exports.signup = async (req, res, next) => {
  try {
    let {
      username,
      password,
      name,
      email,
      phone,
      role = 'mod',
      active = false
    } = req.body;

    // Check if username already exists
    const userDB = await Account.findOne({ username }).select("+username");
    if (userDB) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Tài khoản đã tồn tại. Hãy thử đăng ký tài khoản khác."), req, res, next);
    }

    // Save user to DB
    const user = await Account.create({
      username,
      password,
      role,
      active,
      userInfor: { // Assuming userInfor needs to be created/assigned here
        name,
        email,
        phone
      }
    });

    // Create token and send jwt to client
    const userData = {
      id: user.id,
      username,
      role: user.role
    }

    const token = await createToken(userData);

    // Remove the password from the output
    user.password = undefined;

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      token,
      data: user
    });

  } catch (err) {
    next(err);
  }
};
