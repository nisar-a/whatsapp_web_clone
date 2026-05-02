const mongoose = require('mongoose');
const User = require('../models/User');

const seedDemoUsers = async () => {
  const demoUsers = ['alice', 'bob'];

  for (const username of demoUsers) {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      await User.create({ username });
    }
  }
};

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_clone';
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    await seedDemoUsers();
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
