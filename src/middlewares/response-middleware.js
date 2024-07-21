const { HTTP_STATUS } = require('@app/constants/status-code');
const { clearCache } = require('@app/services/cache');
/**
 * Process format of response before send it to client.
 * Handle clear cache here.
 * @param {*} results data which get from controller.
 */
exports.format = (results, req, res, next) => {

  if (results instanceof Error) {
    return res.status(results?.statusCode || HTTP_STATUS.BAD_REQUEST).json({
      code: results?.statusCode || 400,
      status: results?.name || "failed",
      data: results?.data || [],
      message: results?.message || "Đã có lỗi gì đó mà chưa xác định được.",
    })
  }

  return res.status(HTTP_STATUS.OK).json({
    code: HTTP_STATUS.OK,
    status: "Success",
    data: results,
    message: "Thao tác thành công"
  })
}