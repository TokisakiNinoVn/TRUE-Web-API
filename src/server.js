require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const  publicRoutes = require('./routes/public/index');
const privateRoutes  = require('./routes/private/index');
const { connectDB } = require('./configs/db');

const app = express();
app.use(express.json());

// Connect to the database
connectDB();

// Use public routes
app.use('/public', publicRoutes);

// Use private routes
app.use('/private', privateRoutes);

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
