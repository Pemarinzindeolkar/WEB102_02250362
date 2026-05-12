const express = require('express');
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getCommentById);

// Protected routes
router.post('/', protect, commentController.createComment);
router.put('/:id', protect, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);

// Like/unlike comment
router.post('/:id/like', protect, commentController.toggleCommentLike);
router.delete('/:id/like', protect, commentController.toggleCommentLike);

module.exports = router;