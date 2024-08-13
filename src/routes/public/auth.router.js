const express = require('express');
const { authentication } = require('../../controllers/index');

const router = express.Router();


router.post('/signup', authentication.signup);
router.post('/login', authentication.login);
router.post('/logout', authentication.logout);

module.exports = router;
