const express = require('express');
const router = express.Router();
const { accountController } = require('../../controllers/index');

router.get('/:id', accountController.getAccountDetails)

module.exports = router;