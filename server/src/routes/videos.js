const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// GET /api/videos - Get all videos
router.get('/', videoController.getAllVideos);

// POST /api/videos - Create new video
router.post('/', videoController.createVideo);

// GET /api/videos/:id - Get video by ID
router.get('/:id', videoController.getVideoById);

// PUT /api/videos/:id - Update video
router.put('/:id', videoController.updateVideo);

// DELETE /api/videos/:id - Delete video
router.delete('/:id', videoController.deleteVideo);

// GET /api/videos/:id/comments - Get video comments
router.get('/:id/comments', videoController.getVideoComments);

// GET /api/videos/:id/likes - Get video likes
router.get('/:id/likes', videoController.getVideoLikes);

// POST /api/videos/:id/likes - Like video
router.post('/:id/likes', videoController.likeVideo);

// DELETE /api/videos/:id/likes - Unlike video
router.delete('/:id/likes', videoController.unlikeVideo);

module.exports = router;