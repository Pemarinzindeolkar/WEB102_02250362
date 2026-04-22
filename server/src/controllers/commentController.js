const dataStore = require('../models');

// GET all comments
const getAllComments = (req, res) => {
  res.status(200).json(dataStore.comments);
};

// GET comment by ID
const getCommentById = (req, res) => {
  const commentId = parseInt(req.params.id);
  const comment = dataStore.comments.find(c => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  res.status(200).json(comment);
};

// POST create a new comment
const createComment = (req, res) => {
  const { text, userId, videoId } = req.body;

  // Basic validation
  if (!text || !userId || !videoId) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Check if user exists
  const userExists = dataStore.users.some(u => u.id === parseInt(userId));
  if (!userExists) {
    return res.status(400).json({ error: 'User does not exist' });
  }

  // Check if video exists
  const videoExists = dataStore.videos.some(v => v.id === parseInt(videoId));
  if (!videoExists) {
    return res.status(400).json({ error: 'Video does not exist' });
  }

  const newComment = {
    id: dataStore.nextIds.comments++,
    text,
    userId: parseInt(userId),
    videoId: parseInt(videoId),
    likes: [],
    createdAt: new Date().toISOString()
  };

  dataStore.comments.push(newComment);

  res.status(201).json(newComment);
};

// PUT update a comment
const updateComment = (req, res) => {
  const commentId = parseInt(req.params.id);
  const commentIndex = dataStore.comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const { text } = req.body;
  const comment = dataStore.comments[commentIndex];

  // Update field if provided
  if (text) comment.text = text;

  comment.updatedAt = new Date().toISOString();

  res.status(200).json(comment);
};

// DELETE a comment
const deleteComment = (req, res) => {
  const commentId = parseInt(req.params.id);
  const commentIndex = dataStore.comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  dataStore.comments.splice(commentIndex, 1);

  res.status(204).end();
};

// GET comment likes
const getCommentLikes = (req, res) => {
  const commentId = parseInt(req.params.id);
  const comment = dataStore.comments.find(c => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const likedUsers = comment.likes.map(userId => {
    return dataStore.users.find(u => u.id === userId);
  }).filter(Boolean);

  res.status(200).json(likedUsers);
};

// POST like a comment
const likeComment = (req, res) => {
  const commentId = parseInt(req.params.id);
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const userIdInt = parseInt(userId);
  const comment = dataStore.comments.find(c => c.id === commentId);
  const user = dataStore.users.find(u => u.id === userIdInt);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if already liked
  if (comment.likes.includes(userIdInt)) {
    return res.status(409).json({ error: 'User already liked this comment' });
  }

  // Add like
  comment.likes.push(userIdInt);

  res.status(201).json({ message: 'Comment liked successfully' });
};

// DELETE unlike a comment
const unlikeComment = (req, res) => {
  const commentId = parseInt(req.params.id);
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const userIdInt = parseInt(userId);
  const comment = dataStore.comments.find(c => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  // Check if like exists
  const likeIndex = comment.likes.indexOf(userIdInt);
  if (likeIndex === -1) {
    return res.status(404).json({ error: 'Like not found' });
  }

  // Remove like
  comment.likes.splice(likeIndex, 1);

  res.status(204).end();
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentLikes,
  likeComment,
  unlikeComment
};