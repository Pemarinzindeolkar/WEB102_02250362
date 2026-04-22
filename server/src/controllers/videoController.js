const prisma = require('../lib/prisma');

// Get all videos
const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.Video.findMany({
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
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format videos
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      url: video.url,
      userId: video.userId,
      createdAt: video.createdAt,
      user: video.user,
      likeCount: video._count.likes,
      commentCount: video._count.comments,
      isLiked: false
    }));
    
    // Check if user is logged in and has liked videos
    if (req.user) {
      const userId = req.user.id;
      const videoIds = videos.map(v => v.id);
      
      const userLikes = await prisma.Like.findMany({
        where: {
          userId: parseInt(userId),
          videoId: { in: videoIds }
        }
      });
      
      formattedVideos.forEach(video => {
        video.isLiked = userLikes.some(like => like.videoId === video.id);
      });
    }
    
    res.json({
      videos: formattedVideos,
      pagination: {
        nextCursor: null,
        hasNextPage: false
      }
    });
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get video by ID
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await prisma.Video.findUnique({
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user has liked this video
    if (req.user) {
      const userId = req.user.id;
      const like = await prisma.Like.findUnique({
        where: {
          userId_videoId: {
            userId: parseInt(userId),
            videoId: parseInt(id)
          }
        }
      });
      video.isLiked = !!like;
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ message: 'Failed to fetch video' });
  }
};

// Create video
const createVideo = async (req, res) => {
  try {
    const { title, url } = req.body;
    const userId = req.user.id;
    
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }
    
    const video = await prisma.Video.create({
      data: {
        title,
        url,
        userId: parseInt(userId)
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
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Failed to create video' });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url } = req.body;
    const userId = req.user.id;
    
    // Check if video exists
    const video = await prisma.Video.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user owns the video
    if (video.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }
    
    // Update video
    const updatedVideo = await prisma.Video.update({
      where: { id: parseInt(id) },
      data: {
        title: title || video.title,
        url: url || video.url
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
    
    res.json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Failed to update video' });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if video exists
    const video = await prisma.Video.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user owns the video
    if (video.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    // Delete video and related records
    await prisma.$transaction([
      prisma.Like.deleteMany({ where: { videoId: parseInt(id) } }),
      prisma.Comment.deleteMany({ where: { videoId: parseInt(id) } }),
      prisma.Video.delete({ where: { id: parseInt(id) } })
    ]);
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Failed to delete video' });
  }
};

// Like video
const likeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if video exists
    const video = await prisma.Video.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if already liked
    const existingLike = await prisma.Like.findUnique({
      where: {
        userId_videoId: {
          userId: parseInt(userId),
          videoId: parseInt(id)
        }
      }
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'Video already liked' });
    }
    
    // Create like
    await prisma.Like.create({
      data: {
        userId: parseInt(userId),
        videoId: parseInt(id)
      }
    });
    
    // Get updated like count
    const likeCount = await prisma.Like.count({
      where: { videoId: parseInt(id) }
    });
    
    res.json({ 
      message: 'Video liked successfully',
      action: 'liked',
      likeCount
    });
  } catch (error) {
    console.error('Error liking video:', error);
    res.status(500).json({ message: 'Failed to like video' });
  }
};

// Unlike video
const unlikeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if video exists
    const video = await prisma.Video.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Delete like
    await prisma.Like.deleteMany({
      where: {
        userId: parseInt(userId),
        videoId: parseInt(id)
      }
    });
    
    // Get updated like count
    const likeCount = await prisma.Like.count({
      where: { videoId: parseInt(id) }
    });
    
    res.json({ 
      message: 'Video unliked successfully',
      action: 'unliked',
      likeCount
    });
  } catch (error) {
    console.error('Error unliking video:', error);
    res.status(500).json({ message: 'Failed to unlike video' });
  }
};

// Get user's videos
const getUserVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const videos = await prisma.Video.findMany({
      where: { userId: parseInt(userId) },
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
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      url: video.url,
      userId: video.userId,
      createdAt: video.createdAt,
      user: video.user,
      likeCount: video._count.likes,
      commentCount: video._count.comments
    }));
    
    res.json(formattedVideos);
  } catch (error) {
    console.error('Error getting user videos:', error);
    res.status(500).json({ message: 'Failed to get user videos' });
  }
};

// Get video comments
const getVideoComments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comments = await prisma.Comment.findMany({
      where: { videoId: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Failed to get comments' });
  }
};

// Add comment to video
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    // Check if video exists
    const video = await prisma.Video.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const comment = await prisma.Comment.create({
      data: {
        content,
        userId: parseInt(userId),
        videoId: parseInt(id)
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
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Export all functions
module.exports = {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  unlikeVideo,
  getUserVideos,
  getVideoComments,
  addComment
};