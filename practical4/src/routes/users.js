const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');


const router = express.Router();

// Public routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.delete('/:id', protect, userController.deleteUser);
router.put('/:id', protect, upload.single('avatar'), userController.updateUser);

// User's videos, followers, following
router.get('/:id/videos', userController.getUserVideos);
router.get('/:id/followers', userController.getUserFollowers);
router.get('/:id/following', userController.getUserFollowing);

// Follow/unfollow
router.post('/:id/follow', protect, userController.followUser);
router.delete('/:id/follow', protect, userController.unfollowUser);

module.exports = router;