const express = require('express');
const router = express.Router();
const { accountController } = require('../../controllers/index');

router.get('/:id', accountController.getAccountDetails)
router.get('/', accountController.getAllAccounts)
router.delete('/:id', accountController.deleteAccount)
router.put('/:username', accountController.updateAccount)

module.exports = router;