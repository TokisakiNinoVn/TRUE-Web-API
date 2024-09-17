const express = require('express');
const router = express.Router();
const { postController } = require('../../controllers/index');


// Route to add a new post
router.post('/', postController.add);

// Route to edit an existing post by its ID
router.patch('/:id', postController.edit);

module.exports = router;
