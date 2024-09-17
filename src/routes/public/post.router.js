const express = require('express');
const router = express.Router();
const { postController } = require('../../controllers/index');

// Route to get details of a post by its ID
router.get('/all', postController.getAll);

// Route to get details of a post by its ID
router.get('/details/:id', postController.getDetailsById);

// Route to get all posts by a username
router.get('/user/:username', postController.getInforByUsername);

// Route to search for posts based on query parameters
router.get('/search', postController.search);

// Route to get the 10 most recent posts
router.get('/latest', postController.getLatestPosts);

// Route to get the 10 posts with the lowest price
router.get('/lowest-price', postController.getLowestPricedPosts);

module.exports = router;
