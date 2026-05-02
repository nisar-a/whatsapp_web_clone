const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const populateMessage = async (message) => {
  await message.populate([
    { path: 'senderId', select: 'username lastSeenAt isOnline' },
    { path: 'receiverId', select: 'username lastSeenAt isOnline' },
    { path: 'readBy', select: 'username' },
  ]);

  return message;
};

/**
 * Send a message
 * POST /api/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    // Validation
    if (!senderId || !receiverId || !text || text.trim() === '') {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
      return res.status(400).json({ error: 'Invalid sender or receiver' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    const message = new Message({
      senderId,
      receiverId,
      text: text.trim(),
      readBy: [],
    });

    await message.save();
    await populateMessage(message);

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get conversation between two users
 * GET /api/messages/:senderId/:receiverId
 */
exports.getConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
      return res.status(400).json({ error: 'Invalid sender or receiver' });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .populate('senderId', 'username lastSeenAt isOnline')
      .populate('receiverId', 'username lastSeenAt isOnline')
      .populate('readBy', 'username')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getConversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all messages
 * GET /api/messages
 */
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('senderId', 'username lastSeenAt isOnline')
      .populate('receiverId', 'username lastSeenAt isOnline')
      .populate('readBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getAllMessages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get conversation summaries for the sidebar
 * GET /api/messages/summary/:userId
 */
exports.getConversationSummaries = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'username lastSeenAt isOnline')
      .populate('receiverId', 'username lastSeenAt isOnline')
      .sort({ createdAt: -1 });

    const summaries = new Map();

    messages.forEach((message) => {
      const senderId = message.senderId?._id?.toString();
      const receiverId = message.receiverId?._id?.toString();
      const isCurrentUserSender = senderId === userId;
      const otherUser = isCurrentUserSender ? message.receiverId : message.senderId;

      if (!otherUser) {
        return;
      }

      const conversationKey = otherUser._id.toString();

      if (!summaries.has(conversationKey)) {
        summaries.set(conversationKey, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      const summary = summaries.get(conversationKey);

      if (!isCurrentUserSender) {
        const isReadByCurrentUser = Array.isArray(message.readBy)
          ? message.readBy.some((reader) => reader?._id?.toString?.() === userId || reader?.toString?.() === userId)
          : false;

        if (!isReadByCurrentUser) {
          summary.unreadCount += 1;
        }
      }
    });

    const response = Array.from(summaries.values()).sort(
      (left, right) => new Date(right.lastMessage.createdAt) - new Date(left.lastMessage.createdAt)
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getConversationSummaries:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Mark conversation as read
 * POST /api/messages/read
 */
exports.markConversationAsRead = async (req, res) => {
  try {
    const { readerId, otherUserId } = req.body;

    if (!readerId || !otherUserId) {
      return res.status(400).json({ error: 'readerId and otherUserId are required' });
    }

    if (!isValidObjectId(readerId) || !isValidObjectId(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const result = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: readerId,
        readBy: { $ne: readerId },
      },
      {
        $addToSet: { readBy: readerId },
        $set: { readAt: new Date() },
      }
    );

    res.status(200).json({
      message: 'Conversation marked as read',
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error('Error in markConversationAsRead:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
