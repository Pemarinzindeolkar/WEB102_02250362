const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            videos: true,
            followedBy: true,
            following: true
          }
        }
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            videos: true,
            followedBy: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Register
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (userExists) {
      return res.status(400).json({
        message:
          userExists.email === email
            ? 'Email already in use'
            : 'Username already in use'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user videos (FIXED)
exports.getUserVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { cursor, limit = 10 } = req.query;
    const limitNum = parseInt(limit) || 10;

    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const queryOptions = {
      where: { userId: parseInt(id) },
      take: limitNum + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
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

    const videos = await prisma.video.findMany(queryOptions);

    const hasNextPage = videos.length > limitNum;
    if (hasNextPage) videos.pop();

    const formattedVideos = videos.map(video => ({
      ...video,
      likeCount: video._count.likes,
      commentCount: video._count.comments,
      _count: undefined
    }));

    const nextCursor =
      hasNextPage
        ? formattedVideos[formattedVideos.length - 1].id.toString()
        : null;

    res.status(200).json({
      videos: formattedVideos,
      pagination: {
        nextCursor,
        hasNextPage
      }
    });
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, bio } = req.body;

    let avatarPath = null;

    if (req.files?.avatar) {
      const file = req.files.avatar[0];
      avatarPath = `/uploads/${file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatarPath && { avatar: avatarPath })
      }
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Followers
exports.getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(id) },
      include: { follower: true }
    });

    res.json(followers.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch followers' });
  }
};

// Following
exports.getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const following = await prisma.follow.findMany({
      where: { followerId: parseInt(id) },
      include: { following: true }
    });

    res.json(following.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch following' });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: parseInt(id)
      }
    });

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: parseInt(id)
        }
      }
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};