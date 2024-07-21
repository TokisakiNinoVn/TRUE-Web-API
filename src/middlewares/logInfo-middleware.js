const { Logs } = require('@app/models');
exports.processLogInfo = async (request, response, next) => {
  const logInfo = {
    username: request.username,
    device: request.headers["device"] || 'Unknown',
    client: request.headers["client"] || 'Unknown',
  }
  request.logInfo = logInfo;
  next();
}

exports.writeLog = async (results, request, response, next) => {
  if (request.method?.toUpperCase() != "GET" && process.env.NODE_ENV === 'production') {
    if (results instanceof Error) {
      return next(results, request, response, next);
    }
    try {
      const logBody = {
        command: `${request.originalUrl}`,
        action: `${request.method}`,
        account: `${request.username}`,
        content: JSON.stringify(request?.body),
        result: JSON.stringify(results)
      }
      await Logs.create(logBody);
    } catch (error) {
      console.log(error)
    } finally {
      return next(results, request, response, next);
    }
  }
  return next(results, request, response, next);
}