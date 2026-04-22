const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// POST /api/users - Create new user
router.post('/', userController.createUser);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

// GET /api/users/:id/videos - Get user videos
router.get('/:id/videos', userController.getUserVideos);

// GET /api/users/:id/followers - Get followers
router.get('/:id/followers', userController.getUserFollowers);

// POST /api/users/:id/followers - Follow user
router.post('/:id/followers', userController.followUser);

// DELETE /api/users/:id/followers - Unfollow user
router.delete('/:id/followers', userController.unfollowUser);

module.exports = router;