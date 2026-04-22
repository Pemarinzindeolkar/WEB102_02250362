const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes (no authentication needed)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/videos', userController.getUserVideos);
router.get('/:id/followers', userController.getUserFollowers);
router.get('/:id/following', userController.getUserFollowing);

// Protected routes (require authentication)
router.get('/me', protect, userController.getCurrentUser);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, userController.deleteUser);
router.post('/:id/follow', protect, userController.followUser);
router.delete('/:id/follow', protect, userController.unfollowUser);

module.exports = router;