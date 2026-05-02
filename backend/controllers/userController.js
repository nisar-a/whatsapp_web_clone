const User = require('../models/User');

/**
 * Create a new user or login existing user
 * POST /api/users
 */
exports.createOrLoginUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    let user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      user = new User({ username: normalizedUsername });
      await user.save();
      return res.status(201).json({
        message: 'User created successfully',
        user,
      });
    }

    res.status(200).json({
      message: 'User logged in',
      user,
    });
  } catch (error) {
    console.error('Error in createOrLoginUser:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all users
 * GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-socketId');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get user by ID
 * GET /api/users/:userId
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-socketId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
