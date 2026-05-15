const express = require('express');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// GET /profile  —  protected: only accessible with a valid token
router.get('/profile', verifyToken, (req, res) => {
  // req.user was set by the verifyToken middleware after decoding the JWT
  res.json({
    message: 'Welcome! You accessed a protected route.',
    user: req.user,
  });
});

module.exports = router;