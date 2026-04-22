const prisma = require('../lib/prisma');

// Get all comments for a video
const getAllComments = async (req, res) => {
  try {
    const { videoId } = req.query;
    const { cursor, limit = 20 } = req.query;
    const limitNum = parseInt(limit) || 20;
    
    if (!videoId) {
      return res.status(400).json({ message: 'videoId query parameter is required' });
    }
    
    // Check if video exists
    const videoExists = await prisma.Video.findUnique({
      where: { id: parseInt(videoId) },
    });
    
    if (!videoExists) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Build query options
    const queryOptions = {
      where: {
        videoId: parseInt(videoId),
      },
      take: limitNum + 1,
      orderBy: {
        createdAt: 'desc',
      },
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
        },
        likes: {
          select: {
            userId: true,
          },
        },
      }
    };
    
    if (cursor) {
      queryOptions.cursor = {
        id: parseInt(cursor),
      };
      queryOptions.skip = 1;
    }
    
    const comments = await prisma.Comment.findMany(queryOptions);
    
    const hasNextPage = comments.length > limitNum;
    
    if (hasNextPage) {
      comments.pop();
    }
    
    if (req.user) {
      const userId = req.user.id;
      comments.forEach(comment => {
        comment.isLiked = comment.likes.some(like => like.userId === parseInt(userId));
      });
    }
    
    const formattedComments = comments.map(comment => ({
      ...comment,
      likeCount: comment._count.likes,
      _count: undefined,
      likes: undefined,
    }));
    
    const nextCursor = hasNextPage ? formattedComments[formattedComments.length - 1].id.toString() : null;
    
    res.status(200).json({
      comments: formattedComments,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comment by ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.Comment.findUnique({
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
            caption: true,
            thumbnailUrl: true
          }
        },
        _count: {
          select: { likes: true }
        }
      }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (req.user) {
      const userId = req.user.id;
      
      const like = await prisma.CommentLike.findUnique({
        where: {
          userId_commentId: {
            userId: parseInt(userId),
            commentId: parseInt(id)
          }
        }
      });
      
      comment.isLiked = !!like;
    }
    
    res.status(200).json(comment);
  } catch (error) {
    console.error(`Error fetching comment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch comment' });
  }
};

// Create comment
const createComment = async (req, res) => {
  try {
    const { videoId, content } = req.body;
    const userId = req.user.id;
    
    if (!videoId || !content) {
      return res.status(400).json({ message: 'videoId and content are required' });
    }
    
    const video = await prisma.Video.findUnique({
      where: { id: parseInt(videoId) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const comment = await prisma.Comment.create({
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
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const comment = await prisma.Comment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    const updatedComment = await prisma.Comment.update({
      where: { id: parseInt(id) },
      data: {
        content,
        updatedAt: new Date()
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
    
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error(`Error updating comment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const comment = await prisma.Comment.findUnique({
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
    
    if (comment.userId !== parseInt(userId) && comment.video.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await prisma.Comment.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting comment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Like comment
const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const comment = await prisma.Comment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const existingLike = await prisma.CommentLike.findUnique({
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
    
    await prisma.CommentLike.create({
      data: {
        userId: parseInt(userId),
        commentId: parseInt(id)
      }
    });
    
    const likeCount = await prisma.CommentLike.count({
      where: { commentId: parseInt(id) }
    });
    
    res.status(200).json({
      message: 'Comment liked successfully',
      action: 'liked',
      likeCount
    });
  } catch (error) {
    console.error(`Error liking comment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
};

// Unlike comment
const unlikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const comment = await prisma.Comment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    await prisma.CommentLike.deleteMany({
      where: {
        userId: parseInt(userId),
        commentId: parseInt(id)
      }
    });
    
    const likeCount = await prisma.CommentLike.count({
      where: { commentId: parseInt(id) }
    });
    
    res.status(200).json({
      message: 'Comment unliked successfully',
      action: 'unliked',
      likeCount
    });
  } catch (error) {
    console.error(`Error unliking comment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to unlike comment' });
  }
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
};