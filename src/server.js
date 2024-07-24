const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({ path: 'environment/.env' });

const app = require('./app');

const database = process.env.MONGODB_URI;
const configDB = {
    user: process.env.DATABASE_USERNAME,
    pass: process.env.DATABASE_PASSWORD,
    authSource: 'admin',
};

// log thử các biến kết nối DB
console.log('>> MONGODB_URI:', process.env.MONGODB_URI);
console.log('>> DATABASE_USERNAME:', process.env.DATABASE_USERNAME);
console.log('>> DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD);

if (!database) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}

// Kết nối cơ sở dữ liệu
mongoose.connect(database, configDB)
    .then(() => {
        console.log('>> DB connection successfully!');
        // Có thể thêm logger nếu cần
    })
    .catch(error => {
        console.log(`>> DB connection failed! Error: ${error}`);
        // Có thể thêm logger nếu cần
    });

// Bắt đầu máy chủ
const port = process.env.PORT || 6000;
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`>> Application is running on port ${port}`);
    // Có thể thêm logger nếu cần
});

module.exports = server;
