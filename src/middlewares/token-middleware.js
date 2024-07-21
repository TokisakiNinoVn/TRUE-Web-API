const AppError = require('@app/utils/app-error');
const jwt = require("jsonwebtoken");
const { HTTP_STATUS } = require('@app/constants/status-code');

exports.protect = async (req, res, next) => {
  try {
    // 1) check if the token is there
    let token = req.headers.authorization.replace('Bearer ',''); 
    if (typeof token == 'undefined' || token == null || token === 'null' || token === '') {
      return next(new AppError(401, 'failed', 'You are not logged in! Please login in to continue'), req, res, next);
    }

    // 2) Verify token 
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.jwtDecoded = decode;
    req.username = decode.userInfo.username;

    // 3) check if the user is exist (not deleted). But should be consider due performance issue.
    // const user = await User.findById(decode.id);
    // if (!user) {
    //     return next(new AppError(401, 'fail', 'This user is no longer exist'), req, res, next);
    // }
    // req.user = user;

    next();

  } catch (err) {
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'failed', 'Mã token không hợp lệ. Hãy đăng nhập lại để tiếp tục.'), req, res, next);
  }
};