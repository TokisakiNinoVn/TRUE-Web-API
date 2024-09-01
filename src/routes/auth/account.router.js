const express = require('express');
const router = express.Router();
const { accountController } = require('../../controllers/index');

router.get('/:id', accountController.getAccountDetails)
router.delete('/:id', accountController.deleteAccount)
router.get('/', accountController.getAllAccounts)
router.put('/:id', accountController.updateAccount)

module.exports = router;