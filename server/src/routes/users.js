const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Debug
console.log('userController:', userController);

// GET all users
router.get('/', userController.getAllUsers);

// REGISTER user (FIXED)
router.post('/register', userController.registerUser);

// LOGIN user (ADDED)
router.post('/login', userController.loginUser);

// GET user by ID
router.get('/:id', userController.getUserById);

// UPDATE user
router.put('/:id', userController.updateUser);

// DELETE user
router.delete('/:id', userController.deleteUser);

// GET user videos
router.get('/:id/videos', userController.getUserVideos);

// GET followers
router.get('/:id/followers', userController.getUserFollowers);

// GET following (you are missing this controller route, optional)
router.get('/:id/following', userController.getUserFollowing);

// FOLLOW user
router.post('/:id/follow', userController.followUser);

// UNFOLLOW user
router.delete('/:id/follow', userController.unfollowUser);

module.exports = router;