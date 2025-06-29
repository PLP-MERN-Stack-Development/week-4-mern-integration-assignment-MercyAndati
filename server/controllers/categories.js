const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Post = require('../models/Post');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  // Optional: Add pagination
  const categories = await Category.find();
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new ErrorResponse(`Category not found with id ${req.params.id}`, 404));
  }
  
  res.status(200).json({ success: true, data: category });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!category) {
    return next(new ErrorResponse(`Category not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: category });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new ErrorResponse(`Category not found with id ${req.params.id}`, 404));
  }

  // Prevent deletion if category has posts
  const postsCount = await Post.countDocuments({ category: req.params.id });
  if (postsCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category with ${postsCount} associated posts. Move posts first.`,
        400
      )
    );
  }

  await category.remove();
  res.status(200).json({ success: true, data: {} });
});