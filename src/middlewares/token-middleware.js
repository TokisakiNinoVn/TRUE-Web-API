const AppError = require('../utils/app-error');
const jwt = require("jsonwebtoken");
const { HTTP_STATUS } = require('../constants/status-code');
const dotenv = require('dotenv');
dotenv.config({ path: '../../environment/dev.env' });

const jwtSecret = process.env.JWT_SECRET || "SdSShFguTxptKPTJELuvoOyOUkGfESSp";
// console.log(">> " + jwtSecret);

exports.protect = async (req, res, next) => {
  try {
    // 1) Check if the token is present
    // const fulltoken = req.cookies.token;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'failed', 'You are not logged in! Please login to continue.'), req, res, next);
    }

    const token = authHeader.split(' ')[1].trim();

    // 2) Verify token
    const decoded = jwt.verify(token, jwtSecret);
    req.jwtDecoded = decoded;
    req.username = decoded.userInfo.username;

    next();
  } catch (err) {
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'failed', err.message || 'Invalid token. Please log in again to continue.'), req, res, next);
  }
};