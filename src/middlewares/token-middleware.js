const AppError = require('../utils/app-error');
const { HTTP_STATUS } = require('../constants/status-code');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config({ path: '../../environment/dev.env' });

const jwtSecret = process.env.JWT_SECRET || "SdSShFguTxptKPTJELuvoOyOUkGfESSp";

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log('Authorization Header:', authHeader); // Kiểm tra giá trị header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'failed', 'You are not logged in! Please login to continue.'), req, res, next);
    }

    const token = authHeader.split(' ')[1];
    // console.log('Token:', token); // Kiểm tra giá trị token

    const decoded = jwt.verify(token, jwtSecret);
    req.jwtDecoded = decoded;
    req.username = decoded.userInfo.username;

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'failed', err.message || 'Invalid token. Please log in again to continue.'), req, res, next);
  }
};
