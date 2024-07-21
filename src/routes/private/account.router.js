const express = require('express');
const router = express.Router();
const { accountController } = require('@app/controllers');

// GET /api/private/users
router.get('/', accountController.getAllUsers);
router.get('/search', accountController.search);
router.get('/menus', accountController.getMenus);
router.get('/permissions', accountController.getPermissions);

// GET /api/private/users/:id
router.get('/:id', accountController.getOneUser);

// GET /api/private/users
router.post('/', accountController.addUser);

// PUT /api/private/users/:id
router.put('/:id', accountController.updateUser);

// PUT /api/private/users/:id
router.delete('/:id', accountController.deleteUser);

router.put('/changepassword/:id', accountController.changePassword);



module.exports = router;