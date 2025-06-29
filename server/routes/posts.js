// central routing configuration for all blog post-related HTTP requests
const express = require('express');
const router = express.Router();
const {getPosts,getPost,createPost,updatePost,deletePost} = require('../controllers/posts');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getPosts)
  .post(protect, createPost);
  
router.route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;