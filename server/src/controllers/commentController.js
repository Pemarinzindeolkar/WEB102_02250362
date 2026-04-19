const prisma = require('../lib/prisma');

// Get all comments
exports.getAllComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { cursor, limit = 20 } = req.query;
    const limitNum = parseInt(limit) || 20;
    
    // Check if video exists
    const videoExists = await prisma.video.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!videoExists) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Build query options
    const queryOptions = {
      where: {
        videoId: parseInt(id),
      },
      take: limitNum + 1, // Take one extra to determine if there are more items
      orderBy: {
        createdAt: 'desc', // Newest comments first
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
    
    // If cursor is provided, filter records after the cursor
    if (cursor) {
      queryOptions.cursor = {
        id: parseInt(cursor),
      };
      queryOptions.skip = 1; // Skip the cursor itself
    }
    
    // Get comments
    const comments = await prisma.comment.findMany(queryOptions);
    
    // Check if there are more items
    const hasNextPage = comments.length > limitNum;
    
    // Remove the extra item we used to check for more data
    if (hasNextPage) {
      comments.pop();
    }
    
    // If user is logged in, check if they've liked the comments
    if (req.user) {
      const userId = req.user.id;
      
      // Add isLiked property to comments
      comments.forEach(comment => {
        comment.isLiked = comment.likes.some(like => like.userId === userId);
      });
    }
    
    // Format comments
    const formattedComments = comments.map(comment => ({
      ...comment,
      likeCount: comment._count.likes,
      _count: undefined,
      likes: undefined,
    }));
    
    // Get the next cursor from the last item
    const nextCursor = hasNextPage ? formattedComments[formattedComments.length - 1].id.toString() : null;
    
    res.status(200).json({
      comments: formattedComments,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error(`Error getting comments for video ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comment by ID
exports.getCommentById = async (req, res) => {
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
    
    // If user is logged in, check if they've liked the comment
    if (req.user) {
      const userId = req.user.id;
      
      const like = await prisma.commentLike.findUnique({
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
exports.createComment = async (req, res) => {
  try {
    const { videoId, content } = req.body;
    const userId = req.user.id;
    
    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: parseInt(videoId) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Create comment
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
};

// Update comment
exports.updateComment = async (req, res) => {
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
    
    // Update comment
    const updatedComment = await prisma.comment.update({
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
exports.deleteComment = async (req, res) => {
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
    
    // Check if user is authorized to delete (comment owner or video owner)
    if (comment.userId !== parseInt(userId) && comment.video.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete comment
    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting comment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Like/unlike comment
exports.toggleCommentLike = async (req, res) => {
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
    
    // Check if like already exists
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: parseInt(userId),
          commentId: parseInt(id)
        }
      }
    });
    
    let action;
    
    if (existingLike) {
      // Unlike - delete the like
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: parseInt(userId),
            commentId: parseInt(id)
          }
        }
      });
      action = 'unliked';
    } else {
      // Like - create a like
      await prisma.commentLike.create({
        data: {
          userId: parseInt(userId),
          commentId: parseInt(id)
        }
      });
      action = 'liked';
    }
    
    // Get updated like count
    const likeCount = await prisma.commentLike.count({
      where: { commentId: parseInt(id) }
    });
    
    res.status(200).json({
      message: `Comment ${action} successfully`,
      action,
      likeCount
    });
  } catch (error) {
    console.error(`Error toggling like for comment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

module.exports = {
  getAllComments: exports.getAllComments,
  getCommentById: exports.getCommentById,
  createComment: exports.createComment,
  updateComment: exports.updateComment,
  deleteComment: exports.deleteComment,
  toggleCommentLike: exports.toggleCommentLike
};