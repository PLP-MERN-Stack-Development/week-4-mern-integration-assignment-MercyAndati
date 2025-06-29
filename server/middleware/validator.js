const { check, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');

// Post validation rules
exports.validatePost = [
  check('title', 'Title is required').not().isEmpty(),
  check('title', 'Title must be between 10 and 100 characters').isLength({ min: 10, max: 100 }),
  check('content', 'Content is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Category validation rules
exports.validateCategory = [
  check('name', 'Name is required').not().isEmpty(),
  check('name', 'Name must be between 3 and 50 characters').isLength({ min: 3, max: 50 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }
    next();
  }
];

// User validation rules
exports.validateUser = [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }
    next();
  }
];