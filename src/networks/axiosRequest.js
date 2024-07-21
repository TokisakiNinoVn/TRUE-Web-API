const axios = require('axios').default;

// Next we make an 'instance' of it
const instance = axios.create({
// .. where we make our configurations
    //baseURL: 'http://localhost:5000',
    headers: {
        'Accept': 'application/json, text/plain, */*',       
        'User-Agent': 'API server'
    }
});

module.exports = {
    httpClient: instance
};