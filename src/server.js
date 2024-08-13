require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/public/auth.router');
const privateRoutes = require('./routes/private/private.router');
const { connectDB } = require('./configs/db');

const app = express();
app.use(express.json());

// Connect to the database
connectDB();

// Use public routes
app.use('/api/auth', authRoutes);

// Use private routes
app.use('/api/private', privateRoutes);

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
