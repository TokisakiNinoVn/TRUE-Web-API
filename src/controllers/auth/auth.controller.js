//const jwt = require('jsonwebtoken');
const { Account } = require('@app/models');
const AppError = require('@app/utils/app-error');
const jwt = require("jsonwebtoken");
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
    const userInfo = { username, password } = req.body;

    // Bước 1: validate dữ liệu đăng nhập
    const { error } = LoginSchema.validate(userInfo);
    if (error) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, 'Bad Request', `Validation error: ${error.details.map(x => x.message).join(', ')}`), req, res, next);
    }
    
    // Bước 2: Kiểm tra thông tin username và password trong DB
    const userDB = await Account.findOne({ username }).select("+password").populate("roles userInfo");
    if (!userDB) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Tài khoản không tồn tại!"), req, res, next);
    }

    // Bước 3: Kiểm tra xem mật khẩu có chính xác không?
    if (!(await userDB.correctPassword(password, userDB.password))) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Sai mật khẩu. Xin hãy kiểm tra lại."), req, res, next);
    }

    // Bước 4: Kiểm tra xem tài khoản còn đang được kích hoạt không?
    if (userDB && userDB?.active == false) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Tài khoản chưa được kích hoạt. Liên hệ với BQT để kích hoạt tài khoản"), req, res, next);
    }

    // Bước 5: Tất cả đều Ok thì cấp token và thông báo đăng nhập thành công.
    const userLoginedData = {
      id: userDB.id,
      username: username,
      // roleId: userDB?.role?._id,
      // rolename: userDB?.role?.name,
      fullname: userDB?.userInfo?.fullname
    }
    const token = await createToken(userLoginedData);
    // Remove the password from the output 
    userInfo.password = undefined;

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
  //Destroy token:  make the token be invalid.
  /* let jti = req.jwtDecoded.jti;
  try {
    await jwtr.destroy(jti);
    res.status(200).json({
      status: 'success',
      message: 'Logout successed!'
    })
  } catch (err) {
    next(err);
  } */
  const token  = req.headers["x-access-token"];
  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    token,
    message: 'Đăng xuất thành công.'
  })

}

exports.signup = async (req, res, next) => {
  try {

    //1) Validate user information after pre-process in middleware: username, password, email.
    let {
      username,
      password,
      name,
      email,
      phone,
      role = 'mod',
      active = false
    } = req.body;

    // Check the username already exist or not
    const userDB = await User.findOne({ username }).select("+username");
    if (userDB) {
      return next(new AppError(HTTP_STATUS.BAD_REQUEST, "failed", "Tài khoản đã tồn tại. Hãy thử đăng ký tài khoản khác."), req, res, next);
    }

    //2) Save user to DB
    const user = await User.create({
      username: username,
      password: password,
      name: name,
      email: email,
      phone: phone,
      role: role,
      active: active
    });

    //3) Create token and send jwt to client
    const userData = {
      id: user.id,
      username: username,
      role: user.role
    }

    const token = await createToken(userData);

    //Remove the password from the output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: user
    });

  } catch (err) {
    next(err);
  }

};
