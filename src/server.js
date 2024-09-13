require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const publicRoutes = require('./routes/public/index');
const authApi = require('./routes/auth/index');
const { connectDB } = require('./configs/db');
const cors = require('cors');
const { protect } = require('./middlewares/token-middleware');
const { processLogInfo, writeLog } = require('.//middlewares/logInfo-middleware');
const responseMiddleware = require('./middlewares/response-middleware');
const AppError = require('./utils/app-error');
const path = require('path');
const app = express();

// Cấu hình CORS để cho phép yêu cầu từ frontend
app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Kết nối tới cơ sở dữ liệu
connectDB();

// Cách 1: Chỉ sử dụng express.static
app.use(express.static('public'));

// Sử dụng các route công khai
app.use('/public', publicRoutes);

// Sử dụng các route cần đăng nhập
app.use('/auth', protect, processLogInfo, authApi);

// The API for check server status
app.get('/', function(request, response) {
  response.status(200).json({
    status: "Success",
    message: "The API Server is running! server"
  })
})

app.use((req, res, next) => {
  console.log(`Received request for: ${req.originalUrl}`);
  next();
});

app.use('*', (req, res, next) => {
    const err = new AppError(404, '[failed]', 'Sorry! Route không tồn tại');
    next(err, req, res, next);
});

// Bắt đầu server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});


app.use(writeLog);
app.use(responseMiddleware.format);
