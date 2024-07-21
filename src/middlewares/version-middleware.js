const { HTTP_STATUS } = require('@app/constants/status-code');
const AppError = require('@app/utils/app-error');
const { APP_VERSION_SUPPORTED } = require('@app/configs/appConfig');
/**
 * Kiểm tra phiên bản client sử dụng có phải là phiên bản tương thích với API không.
 * Nếu phiên bản client cũ quá thì trả về thông báo và yêu cầu update version
 */
exports.validateClientVersion= async (req, res, next) => {
  let appVersion = req.headers["app-version"] || 0;

  // console.log(`Phiên bản app: ${appVersion}`)
  if(!appVersion || (Number(appVersion) || 0) < Number(APP_VERSION_SUPPORTED || 0)) {
    return next(new AppError(HTTP_STATUS.VERSION_NOT_SUPPORTED, 'VERSION_NOT_SUPPORTED', 'Phiên bản ứng dụng quá thấp. Vui lòng cập nhật ứng dụng.', ""), req, res, next);
  }
  return next();
}