const prisma = require('../lib/prisma');
const storageService = require('../services/storageService');

// Get all videos
const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
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
    
    res.json(videos);
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get video by ID
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await prisma.video.findUnique({
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
    
    res.json(video);
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ message: 'Failed to fetch video' });
  }
};

// Create video with Supabase Storage
const createVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    
    let videoFile = null;
    if (req.files && req.files.video) {
      videoFile = req.files.video[0];
    }

    if (!videoFile) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const originalName = videoFile.originalname || 'video.mp4';
    const fileExtension = originalName.split('.').pop();
    const fileName = `${Date.now()}-${userId}.${fileExtension}`;
    const fileBuffer = videoFile.buffer || videoFile.data;

    if (!fileBuffer) {
      return res.status(400).json({ message: 'No file data' });
    }

    const { fileUrl } = await storageService.uploadFile(
      'videos',
      fileName,
      fileBuffer
    );

    const video = await prisma.video.create({
      data: {
        title: title || 'Untitled',
        description: description || '',
        videoUrl: fileUrl,
        storagePath: fileName,
        userId: userId
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
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoId = parseInt(id);
    const userId = req.user.id;
    
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    if (video.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (video.storagePath) {
      await storageService.removeFile('videos', video.storagePath);
    }
    
    await prisma.video.delete({
      where: { id: videoId }
    });
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

// Like video
const likeVideo = async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: userId,
          videoId: videoId
        }
      }
    });
    
    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_videoId: {
            userId: userId,
            videoId: videoId
          }
        }
      });
      res.json({ liked: false, message: 'Video unliked' });
    } else {
      await prisma.like.create({
        data: { userId, videoId }
      });
      res.json({ liked: true, message: 'Video liked' });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

module.exports = {
  getAllVideos,
  getVideoById,
  createVideo,
  deleteVideo,
  likeVideo
};
