const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadVideoWithThumbnail } = require('../middleware/upload');
const {
  getAllVideos,
  getVideoById,
  createVideo,
  deleteVideo,
  likeVideo
} = require('../controllers/videoController');

// Test route - MUST be before /:id route
router.get('/test', (req, res) => {
  res.json({ message: 'Videos route is working!', timestamp: new Date() });
});

// Get all videos
router.get('/', getAllVideos);

// Get single video (this will match any route with a parameter)
router.get('/:id', getVideoById);

// Upload video
router.post('/', protect, uploadVideoWithThumbnail, createVideo);

// Like/Unlike video
router.post('/:id/like', protect, likeVideo);

// Delete video
router.delete('/:id', protect, deleteVideo);

module.exports = router;
