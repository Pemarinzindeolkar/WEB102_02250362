const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { posts, users } = require('../utils/mockData');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  let results = [...posts];

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const pagination = {};

  const total = posts.length;

  // Get paginated results
  results = results.slice(startIndex, endIndex);

  // Enhance posts with user data
  const enhancedResults = results.map(post => {
    const user = users.find(user => user.id === post.user_id);

    return {
      ...post,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        profile_picture: user.profile_picture
      }
    };
  });

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
    count: enhancedResults.length,
    total_pages: Math.ceil(total / limit),
    page,
    limit,
    pagination,
    data: enhancedResults
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = posts.find(post => post.id === parseInt(req.params.id));

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Enhance post with user data
  const user = users.find(user => user.id === post.user_id);

  const enhancedPost = {
    ...post,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      profile_picture: user.profile_picture
    }
  };

  res.status(200).json({
    success: true,
    data: enhancedPost
  });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (we'll simulate this)
exports.createPost = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');

  if (!userId) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }

  const user = users.find(user => user.id === parseInt(userId));

  if (!user) {
    return next(
      new ErrorResponse('User not found', 404)
    );
  }

  const newPost = {
    id: posts.length + 1,
    caption: req.body.caption,
    image_url: req.body.image_url,
    user_id: user.id,
    created_at: new Date().toISOString().slice(0, 10)
  };

  posts.push(newPost);

  res.status(201).json({
    success: true,
    data: newPost
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (we'll simulate this)
exports.updatePost = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');

  if (!userId) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }

  let post = posts.find(post => post.id === parseInt(req.params.id));

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the post
  if (post.user_id !== parseInt(userId)) {
    return next(
      new ErrorResponse('Not authorized to update this post', 401)
    );
  }

  const index = posts.findIndex(post => post.id === parseInt(req.params.id));

  posts[index] = {
    ...post,
    ...req.body,
    user_id: post.user_id // Ensure user_id doesn't change
  };

  res.status(200).json({
    success: true,
    data: posts[index]
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (we'll simulate this)
exports.deletePost = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');

  if (!userId) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }

  const post = posts.find(post => post.id === parseInt(req.params.id));

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the post
  if (post.user_id !== parseInt(userId)) {
    return next(
      new ErrorResponse('Not authorized to delete this post', 401)
    );
  }

  const index = posts.findIndex(post => post.id === parseInt(req.params.id));
  posts.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});