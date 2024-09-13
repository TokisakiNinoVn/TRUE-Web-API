const express = require('express');
const app = express();

// The API for check server status
app.get('/', function(request, response) {
  response.status(200).json({
    status: "Success",
    message: "The API Server is running! api"
  })
})

module.exports = app;