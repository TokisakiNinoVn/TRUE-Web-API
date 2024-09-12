const express = require('express');
const router = express.Router();
const { accountController } = require('../../controllers/index');

router.get('/id/:id', accountController.getAccountDetails)
router.get('/:username', accountController.getInforByUsername)

module.exports = router;