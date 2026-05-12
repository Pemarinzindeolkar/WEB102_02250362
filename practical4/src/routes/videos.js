const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/following', protect, videoController.getFollowingVideos);

router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.get('/:id/comments', videoController.getVideoComments);

// Protected routes 
router.post('/', protect, upload.fields([
  { name: 'video', maxCount: 1 }, 
  { name: 'thumbnail', maxCount: 1 }
]), videoController.createVideo);

router.put('/:id', protect, videoController.updateVideo);
router.delete('/:id', protect, videoController.deleteVideo);

// Like/unlike video
router.post('/:id/like', protect, videoController.toggleVideoLike);
router.delete('/:id/like', protect, videoController.toggleVideoLike);

module.exports = router;