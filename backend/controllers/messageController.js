const Message = require('../models/Message');

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

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = new Message({
      senderId,
      receiverId,
      text: text.trim(),
    });

    await message.save();
    await message.populate('senderId receiverId', 'username');

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

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .populate('senderId receiverId', 'username')
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
      .populate('senderId receiverId', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getAllMessages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
