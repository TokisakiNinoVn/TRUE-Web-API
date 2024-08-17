const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const AppError = require('./utils/app-error');
const globalErrHandler = require('./controllers/error/Error');

dotenv.config({ path: 'environment/.env' });

const uri = process.env.MONGODB_URI || "your_default_uri_here";
console.log('Manual MONGODB_URI:', process.env.MONGODB_URI);

if (!uri) {
    console.error('MONGODB_URI is not defined in the environment variables');
    process.exit(1);
}

const app = express();

app.use(helmet());

const limiter = rateLimit({
    max: 15000,
    windowMs: 5 * 60 * 1000,
    message: {
        code: 429,
        status: "rejected",
        msg: '[Too Many Requests from this IP, please try again in 5 minutes] [!]'
    }
});

app.use(express.json());
app.use('/api', limiter);

app.use(express.static('public'));

app.use('/public', require('./routes/public/index'));
app.use('/private', require('./routes/private/index'));

app.use('*', (req, res, next) => {
    const err = new AppError(404, '[failed]', 'Sorry! Route không tồn tại');
    next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
