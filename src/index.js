const express = require('express');
const dotenv = require('dotenv');
const globalErrHandler = require('./controllers/error/Error');

dotenv.config({ path: 'environment/.env' });


const app = express();

// Middleware
app.use(express.json());

// Routes
// Handle undefined Routes
app.use('*', (req, res, next) => {
    const err = new AppError(404, 'failed', 'Sorry! Route không tồn tại');
    next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
