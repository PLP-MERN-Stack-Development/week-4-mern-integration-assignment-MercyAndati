const Post = require("../models/Post")
const asyncHandler = require("../utils/asyncHandler")
const ErrorResponse = require("../utils/ErrorResponse")

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().populate("author", "username").populate("category", "name")
  res.status(200).json({ success: true, data: posts })
})

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  console.log("Received ID:", req.params.id)
  const post = await Post.findById(req.params.id).populate("author category comments.user")

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404))
  }

  // Increment view count
  await post.incrementViewCount()

  res.status(200).json({ success: true, data: post })
})

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  try {
    console.log("Create post request body:", req.body)
    console.log("Create post file:", req.file)

    const { title, content, excerpt, category, tags, isPublished } = req.body
    const author = req.user.id

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^\w]+/g, "-")

    // Store just the filename for the database
    let featuredImagePath = null
    if (req.file) {
      featuredImagePath = req.file.filename // Just store the filename
      console.log("Featured image path:", featuredImagePath)
    }

    const postData = {
      title,
      content,
      excerpt,
      category,
      tags: tags ? tags.split(",") : [],
      isPublished: isPublished === "true" || isPublished === true,
      author,
      slug,
      featuredImage: featuredImagePath,
    }

    console.log("Post data to create:", postData)

    const post = await Post.create(postData)
    res.status(201).json({ success: true, data: post })
  } catch (err) {
    console.error("Create post error:", err)
    next(new ErrorResponse(`Post creation failed: ${err.message}`, 500))
  }
})

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id)

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404))
  }

  // Check ownership
  if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update this post`, 401))
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true, data: post })
})

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  console.log("Delete request for post ID:", req.params.id)
  console.log("User making request:", req.user.id, "Role:", req.user.role)

  const post = await Post.findById(req.params.id)

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404))
  }

  console.log("Post author:", post.author.toString())

  // Check ownership
  if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to delete this post`, 401))
  }

  // Use deleteOne() instead of deprecated remove()
  await Post.findByIdAndDelete(req.params.id)

  console.log("Post deleted successfully")
  res.status(200).json({ success: true, data: {} })
})

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body
  const postId = req.params.id
  const userId = req.user.id

  console.log("Adding comment:", { postId, userId, content })

  if (!content || content.trim() === "") {
    return next(new ErrorResponse("Comment content is required", 400))
  }

  const post = await Post.findById(postId)

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${postId}`, 404))
  }

  // Add comment using the model method
  await post.addComment(userId, content.trim())

  // Fetch the updated post with populated comments
  const updatedPost = await Post.findById(postId).populate("author category comments.user")

  res.status(201).json({
    success: true,
    data: updatedPost,
  })
})
