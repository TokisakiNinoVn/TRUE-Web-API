const express = require('express');
const app = express();

const publicApi = require('./public');
const privateApi = require('./private');
const specialApi = require('./special');
const { restrictTo } = require('./special/Restrict');

// const responseMiddleware = require('@app/middlewares/response-middleware');
// const { processLogInfo, writeLog } = require('@app/middlewares/logInfo-middleware');
// const { protect } = require('@app/middlewares/token-middleware');
// const CacheRouter = require('./cache.router');
// const { validateClientVersion } = require('@app/middlewares/version-middleware');

// app.use(validateClientVersion);

// Cache router
// app.use('/cache', CacheRouter);

// Define public APIs, Any client can invoke these without authentication
app.use('/public', publicApi);

// Client need to authenticate before invoke these APIs.

//get request information  to tracking
app.use('/private', protect, processLogInfo, privateApi);

// Special APIs, with authentication Users and Only Admin or something like this (ex: the APIs for 3rd App) can access the below APIs.
// app.use('/special', restrictTo('admin'), specialApi);

// app.use(writeLog);
// app.use(responseMiddleware.format);

// The API for check server status
app.get('/', function(request, response) {
  response.status(200).json({
    status: "Success",
    message: "The API Server is running!"
  })
})


module.exports = app;