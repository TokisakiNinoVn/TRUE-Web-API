const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const AppError = require('./utils/app-error');
const globalErrHandler = require('./controllers/error/Error');

dotenv.config({ path: 'environment/.env' });

const uri = process.env.MONGODB_URI || "mongodb+srv://ninoslayneko:tokisakinino%402004@cluster0.ccoowve.mongodb.net/";
console.log('Manual MONGODB_URI:', process.env.MONGODB_URI);


console.log('All Environment Variables:', process.env);
console.log('>> Environment Variables:');
console.log(`>> NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`>> PORT: ${process.env.PORT}`);

// const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI is not defined in the environment variables');
    process.exit(1);
}


const app = express();

// Set security HTTP headers
app.use(helmet());

// Limit requests from the same IP
const limiter = rateLimit({
    max: 15000,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: {
        code: 429,
        status: "rejected",
        msg: '[Too Many Requests from this IP, please try again in 5 minutes] [!]'
    }
});

app.use(express.json());
app.use('/api', limiter);

// Declare upload folder for static files
app.use(express.static('public'));

// Public routes
app.use('/api/auth', require('./routes/public/auth.router'));

// Private routes
app.use('/api/private', require('./routes/private/private.router'));

// Handle undefined routes
app.use('*', (req, res, next) => {
    const err = new AppError(404, '[failed]', 'Sorry! Route không tồn tại');
    next(err);
});

// Global error handler
app.use(globalErrHandler);

module.exports = app;
