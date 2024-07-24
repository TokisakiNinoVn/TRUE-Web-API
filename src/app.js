const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
// const hpp = require('hpp');
// const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Load environment variables from .env file
dotenv.config({ path: 'environment/.env' });

// Check if environment variables are loaded
console.log('>> Environment Variables:');
console.log(`>> NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`>> PORT: ${process.env.PORT}`);

const globalErrHandler = require('./controllers/error/Error');
const AppError = require('./utils/app-error');

const app = express();

// Allow Cross-Origin requests
// app.use(cors());

// Set security HTTP headers
// app.use(helmet());

// Prevent parameter pollution
// app.use(hpp());

// Limit request from the same API
const limiter = rateLimit({
    max: 15000,
    windowMs: 5 * 60 * 1000,
    message: {
      code: 429,
      status: "rejected",
      msg: '[Too Many Request from this IP, please try again in 5 minutes] [!]'
    }
});

// Middleware
app.use(express.json());
app.use('/api', limiter);

// Declare upload folder
app.use(express.static('public'));
app.use('/api/', require('./routes/api'));

// Handle undefined Routes
app.use('*', (req, res, next) => {
    const err = new AppError(404, '[failed]', 'Sorry! Route không tồn tại');
    next(err);
});

// Global error handler
app.use(globalErrHandler);

module.exports = app;
