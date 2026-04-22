const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const prisma = require('../lib/prisma');

// Ensure upload directory exists
const uploadDir = 'uploads/videos';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only MP4, WebM, and MOV files are allowed'));
        }
    }
});

// Get all videos (For You feed) - FIXED: using uppercase Video
router.get('/', async (req, res) => {
    try {
        const { cursor, limit = 10 } = req.query;
        const limitNum = parseInt(limit);
        
        const queryOptions = {
            take: limitNum + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
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
        };

        if (cursor) {
            queryOptions.cursor = { id: parseInt(cursor) };
            queryOptions.skip = 1;
        }

        // FIXED: Changed from prisma.video to prisma.Video
        const videos = await prisma.Video.findMany(queryOptions);
        
        const hasNextPage = videos.length > limitNum;
        if (hasNextPage) videos.pop();
        
        const formattedVideos = videos.map(video => ({
            id: video.id,
            title: video.title,
            url: video.url,
            createdAt: video.createdAt,
            user: video.user,
            likeCount: video._count.likes,
            commentCount: video._count.comments,
            isLiked: false
        }));
        
        res.json({
            videos: formattedVideos,
            pagination: {
                hasNextPage,
                nextCursor: hasNextPage ? formattedVideos[formattedVideos.length - 1].id : null
            }
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos', error: error.message });
    }
});

// Get following videos feed
router.get('/following', protect, async (req, res) => {
    try {
        const { cursor, limit = 10 } = req.query;
        const limitNum = parseInt(limit);
        
        const following = await prisma.Follow.findMany({
            where: { followerId: req.user.id },
            select: { followingId: true }
        });
        
        const followingIds = following.map(f => f.followingId);
        
        if (followingIds.length === 0) {
            return res.json({
                videos: [],
                pagination: { hasNextPage: false, nextCursor: null }
            });
        }
        
        const queryOptions = {
            where: { userId: { in: followingIds } },
            take: limitNum + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
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
        };

        if (cursor) {
            queryOptions.cursor = { id: parseInt(cursor) };
            queryOptions.skip = 1;
        }

        const videos = await prisma.Video.findMany(queryOptions);
        
        const hasNextPage = videos.length > limitNum;
        if (hasNextPage) videos.pop();
        
        const formattedVideos = videos.map(video => ({
            id: video.id,
            title: video.title,
            url: video.url,
            createdAt: video.createdAt,
            user: video.user,
            likeCount: video._count.likes,
            commentCount: video._count.comments
        }));
        
        res.json({
            videos: formattedVideos,
            pagination: {
                hasNextPage,
                nextCursor: hasNextPage ? formattedVideos[formattedVideos.length - 1].id : null
            }
        });
    } catch (error) {
        console.error('Error fetching following videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos' });
    }
});

// Get single video
router.get('/:id', async (req, res) => {
    try {
        const video = await prisma.Video.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatar: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
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
        console.error('Error fetching video:', error);
        res.status(500).json({ message: 'Failed to fetch video' });
    }
});

// Upload video
router.post('/upload', protect, upload.single('video'), async (req, res) => {
    try {
        const { caption } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const videoUrl = `/uploads/videos/${req.file.filename}`;
        
        const video = await prisma.Video.create({
            data: {
                title: caption || 'Untitled',
                url: videoUrl,
                userId: req.user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });
        
        res.status(201).json({ 
            message: 'Video uploaded successfully',
            video 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Like video
router.post('/:id/like', protect, async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const userId = req.user.id;

        const existingLike = await prisma.Like.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId
                }
            }
        });

        if (existingLike) {
            await prisma.Like.delete({
                where: {
                    userId_videoId: {
                        userId,
                        videoId
                    }
                }
            });
            res.json({ liked: false });
        } else {
            await prisma.Like.create({
                data: {
                    userId,
                    videoId
                }
            });
            res.json({ liked: true });
        }
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ message: 'Failed to process like' });
    }
});

// Add comment to video
router.post('/:id/comments', protect, async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const { content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Comment content is required' });
        }
        
        const comment = await prisma.Comment.create({
            data: {
                content,
                userId: req.user.id,
                videoId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });
        
        res.status(201).json({ comment });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Failed to create comment' });
    }
});

// Get comments for video
router.get('/:id/comments', async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        
        const comments = await prisma.Comment.findMany({
            where: { videoId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
});

// Delete video
router.delete('/:id', protect, async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        
        const video = await prisma.Video.findUnique({
            where: { id: videoId }
        });
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        if (video.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this video' });
        }
        
        // Delete video file from disk
        const videoPath = path.join(__dirname, '..', video.url);
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }
        
        await prisma.Video.delete({
            where: { id: videoId }
        });
        
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Failed to delete video' });
    }
});

module.exports = router;