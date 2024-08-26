require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const publicRoutes = require('./routes/public/index');
const privateRoutes = require('./routes/private/index');
const { connectDB } = require('./configs/db');
const cors = require('cors');

const app = express();

// Cấu hình CORS để cho phép yêu cầu từ frontend
app.use(cors({
    origin: 'http://localhost:8080', // Địa chỉ frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Kết nối tới cơ sở dữ liệu
connectDB();

// Sử dụng các route công khai
app.use('/public', publicRoutes);

// Sử dụng các route riêng tư
app.use('/private', privateRoutes);

// Bắt đầu server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
