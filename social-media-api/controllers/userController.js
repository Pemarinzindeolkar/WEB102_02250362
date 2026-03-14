const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { users } = require('../utils/mockData');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  let results = [...users];

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const pagination = {};

  const total = users.length;

  // Get paginated results
  results = results.slice(startIndex, endIndex);

  // Pagination info
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: results.length,
    pagination,
    total_pages: Math.ceil(total / limit),
    page,
    limit,
    data: results
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = users.find(user => user.id === parseInt(req.params.id));

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Public
exports.createUser = asyncHandler(async (req, res, next) => {
  const newUser = {
    id: users.length + 1,
    username: req.body.username,
    email: req.body.email,
    full_name: req.body.full_name,
    profile_picture: req.body.profile_picture || 'default-profile.jpg',
    bio: req.body.bio || ''
  };

  // Check if username already exists
  const existingUser = users.find(user => user.username === newUser.username);
  if (existingUser) {
    return next(
      new ErrorResponse('Username already exists', 400)
    );
  }

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (we'll simulate this)
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = users.find(user => user.id === parseInt(req.params.id));

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Update user
  const index = users.findIndex(user => user.id === parseInt(req.params.id));

  users[index] = {
    ...user,
    ...req.body,
    id: user.id // Ensure ID doesn't change
  };

  res.status(200).json({
    success: true,
    data: users[index]
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (we'll simulate this)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = users.find(user => user.id === parseInt(req.params.id));

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Delete user
  const index = users.findIndex(user => user.id === parseInt(req.params.id));
  users.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});