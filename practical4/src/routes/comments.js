const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const prisma = require('../lib/prisma');

// Get all comments for a video (public)
router.get('/', async (req, res) => {
  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ message: 'videoId query parameter is required' });
    }
    
    const comments = await prisma.comment.findMany({
      where: { videoId: parseInt(videoId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Check if current user has liked comments
    if (req.user) {
      const userId = req.user.id;
      comments.forEach(comment => {
        comment.isLiked = comment.likes?.some(like => like.userId === userId) || false;
      });
    }
    
    const formattedComments = comments.map(comment => ({
      ...comment,
      likeCount: comment._count.likes,
      _count: undefined
    }));
    
    res.json(formattedComments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a comment (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { videoId, content } = req.body;
    const userId = req.user.id;
    
    if (!videoId || !content) {
      return res.status(400).json({ message: 'videoId and content are required' });
    }
    
    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: parseInt(videoId) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: parseInt(userId),
        videoId: parseInt(videoId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Get comment by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        video: {
          select: {
            id: true,
            caption: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    console.error('Error getting comment:', error);
    res.status(500).json({ message: 'Failed to get comment' });
  }
});

// Update comment (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Delete comment (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        video: {
          select: { userId: true }
        }
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is comment owner or video owner
    if (comment.userId !== parseInt(userId) && comment.video.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// Like comment (protected)
router.post('/:id/likes', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: parseInt(userId),
          commentId: parseInt(id)
        }
      }
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'Comment already liked' });
    }
    
    await prisma.commentLike.create({
      data: {
        userId: parseInt(userId),
        commentId: parseInt(id)
      }
    });
    
    const likeCount = await prisma.commentLike.count({
      where: { commentId: parseInt(id) }
    });
    
    res.json({ 
      message: 'Comment liked successfully',
      action: 'liked',
      likeCount
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
});

// Unlike comment (protected)
router.delete('/:id/likes', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    await prisma.commentLike.deleteMany({
      where: {
        userId: parseInt(userId),
        commentId: parseInt(id)
      }
    });
    
    const likeCount = await prisma.commentLike.count({
      where: { commentId: parseInt(id) }
    });
    
    res.json({ 
      message: 'Comment unliked successfully',
      action: 'unliked',
      likeCount
    });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ message: 'Failed to unlike comment' });
  }
});

module.exports = router;